'use strict';

const Joi = require('joi');

const Request = require('superagent');
const debug = require('debug')('bg');
const moment = require('moment');
const chalk = require('chalk');

const DevOps = require('../lib/devOps');
const Config = require('../models/Config');
const Version = require('../models/Version');

const BG_API_BASE_URL = 'https://api.biblegateway.com/3';

class AuthenticationService {
    constructor(username, password) {
        this.username = username;
        this.password = password;

        this.valid = false;
        this.userId = null;
        this.accessToken = null;
        this.receivedAt = null;
        this.expiresAt = null
    }

    isExpired() {
        return (this.receivedAt.add(1, 'hours').isAfter(this.expiresAt));
    }

    isAuthenticated() {
        return (this.valid && !this.isExpired());
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            if (this.isAuthenticated()) {
                debug("Already authenticated");
                resolve(this.accessToken);
            } else {
                debug("Sending authentication to BG");
                Request
                    .post(`${BG_API_BASE_URL}/user/authenticate`)
                    .type('form')
                    .send({username: this.username, password: this.password})
                    .accept('json')
                    .then(response => {
                        const body = response.body;
                        if (body.hasOwnProperty('authentication')) {
                            this.valid = body.authentication.success;
                            this.userId = body.authentication.user_id;
                            this.accessToken = body.authentication.access_token;
                            this.expiresAt = moment.unix(body.authentication.expires);
                            this.receivedAt = moment();
                            debug("%O", this);
                            resolve(this.accessToken);
                        } else {
                            reject('Response has no authentication information');
                        }
                    }).catch(err => reject(err));
            }
        });
    }
}

class VersionService {
    constructor(authService) {
        this.authService = authService;

        // Versions available from  Bible Gateway at the time the server starts.
        this.bgAvailableVersions = [];
    }

    // Return the newest of the BG versions.
    newestBgVersion() {
        return this.bgAvailableVersions.reduce((a, b) => {
            return a.last_modified.isAfter(b.last_modified) ? a : b;
        });
    }

    getVersions() {
        return new Promise((resolve, reject) => {
            if (this.bgAvailableVersions.length > 0) {
                // Already have the versions cached; fulfill the promise immediately.
                debug("Already cached BG versions %O", this.bgAvailableVersions);
                resolve(this.bgAvailableVersions);

            } else {
                // Go fetch version data from BG.
                this.authService.authenticate().then(token => {
                    debug("Token %O", token);
                    return Request.get(`${BG_API_BASE_URL}/bible`)
                        .query({access_token: token})
                        .accept('json');
                }).then(response => {
                    // Got version information; format for our purposes and cache result.
                    debug("Response %O", response.body.data);
                    this.bgAvailableVersions = response.body.data.map(elt => ({
                        translation: elt.translation,
                        last_modified: moment(elt.last_modified)
                    }));
                    debug("Fetched BG versions %O", this.bgAvailableVersions);

                    // this.bgAvailableVersions.map(elt => {
                    //     Version.query()
                    //         .where('code', elt.translation)
                    //         .first()
                    //         .then(result => {
                    //             if (!result) {
                    //                 Version.query()
                    //                     .insert({
                    //                         code: elt.translation,
                    //                         title:
                    //                     })
                    //             }
                    //         })
                    // })


                    // Fetch default version information.
                    return Config.getDefaultVersion()
                }).then(config => {
                    // Check that default version is currently licensed.
                    debug("Default version %o", config);
                    const defaultVersion = config.value;
                    if (this.bgAvailableVersions.find(version => version.translation === defaultVersion)) {
                        // Default version is licensed.
                        resolve(this.bgAvailableVersions);
                    } else {
                        // Deault version is not licensed.
                        const licensedVersions = this.bgAvailableVersions.map(elt => elt.translation).join(', ');
                        const newestVersion = this.newestBgVersion();
                        const message = [
                            `Licensed for these versions: ${licensedVersions}.`,
                            `Default version (${defaultVersion}) isn't licensed;`,
                            `using ${newestVersion.translation} instead.`,
                            'Update default version in database.' ].join(' ');
                        DevOps.notifyWarning(message);
                        reject(message);
                    }
                });
            }
        });
    }
}

exports.register = function (server, options, next) {

    const authService = new AuthenticationService(options.username, options.password);
    const versionService = new VersionService(authService);

    function getVersionInfo(version) {
        return authService.authenticate().then(token =>
            Request.get(`${BG_API_BASE_URL}/bible/${version}`)
                .query({access_token: token})
                .then(resp => resp.body.data[0]));
    }

    function getPassage(version, osis) {
        return authService.authenticate().then(token =>
            Request.get(`${BG_API_BASE_URL}/bible/${osis}/${version}`)
                .query({access_token: token})
                .then(resp => resp.body.data[0]));
    }

    server.expose('getPassage', getPassage);

    if (true) {
        server.route([
            {
                method: 'GET',
                path: '/bg/versions',
                config: {
                    description: 'Retrieve list of available versions'
                },
                handler: function (request, reply) {
                    versionService.getVersions()
                        .then(versions => reply(versions))
                        .catch(err => console.log("ERROR", err));
                }
            },

            {
                method: 'GET',
                path: '/bg/versions/{version}',
                config: {
                    description: 'Retrieve version information',
                    validate: {
                        params: {
                            version: Joi.string().required()
                        }
                    }
                },
                handler: function (request, reply) {
                    getVersionInfo(request.params.version)
                        .then(versionInfo => reply(versionInfo));
                }
            },

            {
                method: 'GET',
                path: '/bg/passage/{version}/{osis}',
                config: {
                    description: 'Fetch scripture passage',
                    validate: {
                        params: {
                            version: Joi.string().required(),
                            osis: Joi.string().required()
                        }
                    }
                },
                handler: function (request, reply) {
                    getPassage(request.params.version, request.params.osis)
                        .then(passage => reply(passage));
                }
            }
        ]);
    }

    next();
};

exports.register.attributes = {name: 'bible_gateway', version: '0.0.1'};
