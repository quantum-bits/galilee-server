'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Request = require('superagent');
const debug = require('debug')('bg');
const moment = require('moment');

const ACCESS_TOKEN_KEY = 'bg-access-token';

const Config = require('../models/Config');

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

    authenticate(next) {
        if (this.isAuthenticated()) {
            debug("Already authenticated");
            return next(null, this);
        } else {
            debug("Sending authentication to BG");
            Request
                .post('https://api.biblegateway.com/3/user/authenticate')
                .type('form')
                .send({username: this.username, password: this.password})
                .accept('json')
                .end((err, res) => {
                    if (err) {
                        return next(Boom.serverUnavailable("Can't authenticate"), null);
                    }
                    const response = JSON.parse(res.text);
                    debug("RESPONSE %O", response);
                    if (response.hasOwnProperty('authentication')) {
                        this.valid = response.authentication.success;
                        this.userId = response.authentication.user_id;
                        this.accessToken = response.authentication.access_token;
                        this.expiresAt = moment.unix(response.authentication.expires);
                        this.receivedAt = moment();
                        return next(null, this);
                    } else {
                        return next(Boom.unauthorized('Authentication failed'), null);
                    }
                });
        }
    }
}

exports.register = function (server, options, next) {

    const authService = new AuthenticationService(
        server.settings.app.nconf.get('bg:username'),
        server.settings.app.nconf.get('bg:password'));

    server.method('getTranslations', function (next) {
        authService.authenticate((err, result) => {
            if (err) {
                next(err, null);
            } else {
                Request.get('https://api.biblegateway.com/3/bible')
                    .query({access_token: authService.accessToken})
                    .end((err, res) => {
                        if (err) {
                            return next(Boom.serverUnavailable("Can't list translations"), null);
                        }
                        return next(null, JSON.parse(res.text));
                    });
            }
        });
    });

    server.method('getVersionInfo', function (version, next) {
        authService.authenticate((err, result) => {
            if (err) {
                next(err, null);
            } else {
                Request.get(`https://api.biblegateway.com/3/bible/${version}`)
                    .query({access_token: authService.accessToken})
                    .end((err, res) => {
                        if (err) {
                            return next(Boom.serverUnavailable("Can't get version information"), null);
                        }
                        const response = JSON.parse(res.text);
                        if (!response.hasOwnProperty('data')) {
                            return next(Boom.badData('Invalid version name'), null);
                        }
                        return next(null, response);
                    });
            }
        });
    });

    server.method('getPassage', function (version, osis, next) {
        authService.authenticate((err, result) => {
            if (err) {
                next(err, null);
            } else {
                Request.get(`https://api.biblegateway.com/3/bible/${osis}/${version}`)
                    .query({access_token: authService.accessToken})
                    .end((err, res) => {
                        if (err) {
                            return next(Boom.serverUnavailable("Can't get passage"), null);
                        }
                        const response = JSON.parse(res.text);
                        if (!response.hasOwnProperty('data')) {
                            return next(Boom.badData('Invalid version or passage'), null);
                        }
                        return next(null, response);
                    });
            }
        });
    });

    if (false) {
        server.route(
            [
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
                        pre: ['getPassage(params.version, params.osis)']
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
