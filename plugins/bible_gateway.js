'use strict';

const Joi = require('joi');

const Request = require('superagent');
const debug = require('debug')('bg');
const moment = require('moment');

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
                    .post('https://api.biblegateway.com/3/user/authenticate')
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
                            debug("AUTH SERVICE %O", this);
                            resolve(this.accessToken);
                        } else {
                            reject('Response has no authentication information');
                        }
                    }).catch(err => reject(err));
            }
        });
    }
}

exports.register = function (server, options, next) {

    const authService =
        new AuthenticationService(options.username, options.password);

    function getTranslations() {
        return authService.authenticate().then(token =>
            Request.get('https://api.biblegateway.com/3/bible')
                .query({access_token: token})
                .then(resp => resp.body.data));
    }

    function getVersionInfo(version) {
        return authService.authenticate().then(token =>
            Request.get(`https://api.biblegateway.com/3/bible/${version}`)
                .query({access_token: token})
                .then(resp => resp.body.data[0]));
    }

    function getPassage(version, osis) {
        return authService.authenticate().then(token =>
            Request.get(`https://api.biblegateway.com/3/bible/${osis}/${version}`)
                .query({access_token: token})
                .then(resp => resp.body.data[0]));
    }

    server.expose('getPassage', getPassage);

    server.method('getTranslations', function (next) {
        getTranslations()
            .then(response => next(null, response))
            .catch(err => next(err, null));
    });

    server.method('getVersionInfo', function (version, next) {
        getVersionInfo(version)
            .then(response => next(null, response))
            .catch(err => next(err, null));
    });

    server.method('getPassage', function (version, osis, next) {
        getPassage(version, osis)
            .then(response => next(null, response))
            .catch(err => next(err, null));
    });

    if (false) {
        server.route([
            {
                method: 'GET',
                path: '/bg/translations',
                config: {
                    description: 'Retrieve list of available translations',
                    pre: ['getTranslations()']
                },
                handler: function (request, reply) {
                    reply(request.pre.getTranslations);
                }
            },

            {
                method: 'GET',
                path: '/bg/translations/{version}',
                config: {
                    description: 'Retrieve version information',
                    validate: {
                        params: {
                            version: Joi.string().required()
                        }
                    },
                    pre: ['getVersionInfo(params.version)']
                },
                handler: function (request, reply) {
                    reply(request.pre.getVersionInfo);
                }
            },

            {
                method: 'GET',
                path: '/bg/translations/{version}/{osis}',
                config: {
                    description: 'Fetch scripture passage',
                    validate: {
                        params: {
                            version: Joi.string().required(),
                            osis: Joi.string().required()
                        }
                    },
                    pre: ['getPassage(params.version,params.osis)']
                },
                handler: function (request, reply) {
                    reply(request.pre.getPassage);
                }
            }
        ]);
    }

    next();
};

exports.register.attributes = {name: 'bible_gateway', version: '0.0.1'};
