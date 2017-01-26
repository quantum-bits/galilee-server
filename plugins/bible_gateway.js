'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Request = require('superagent');

const ACCESS_TOKEN_KEY = 'bg-access-token';

const Config = require('../models/Config');

exports.register = function (server, options, next) {

    /**
     * Delete the access token from the database.
     * @returns {Promise}
     */
    function delete_access_token() {
        return Config.query()
            .delete()
            .where('key', ACCESS_TOKEN_KEY);
    }

    /**
     * Insert a new access token in the database.
     * @param new_token
     * @returns {Promise}
     */
    function insert_access_token(new_token) {
        return Config.query()
            .insert({key: ACCESS_TOKEN_KEY, value: new_token});
    }

    /**
     * Fetch the access token from the database. Resolves to a token value
     * that will be null if there is no access token currently stored
     * or a string containing the action token. Callers should use this value
     * to determine whether or not the system is authenticated with Bible Gateway.
     * @returns {Promise}
     */
    function get_access_token() {
        return Config.query()
            .where('key', ACCESS_TOKEN_KEY)
            .then(rows => {
                if (rows.length === 1) {
                    return rows[0].value;
                } else {
                    return null;
                }
            });
    }

    function bg_authenticate(username, password, next) {
        delete_access_token().then(() => {
            Request
                .post('https://api.biblegateway.com/3/user/authenticate')
                .type('form')
                .send({username: username, password: password})
                .accept('json')
                .end(function (err, res) {
                    if (err) {
                        return next(Boom.serverUnavailable("Can't authenticate"), null);
                    }
                    const response = JSON.parse(res.text);
                    if (response.hasOwnProperty('authentication')) {
                        insert_access_token(response.authentication.access_token).then(tuple => {
                            return next(null, response);
                        })
                    } else {
                        return next(Boom.unauthorized('Authentication failed'), null);
                    }
                });
        });
    }

    function bg_translations(next) {
        get_access_token()
            .then(token => {
                if (!token) {
                    return next(Boom.unauthorized('Must authenticate first'), null);
                } else {
                    Request
                        .get('https://api.biblegateway.com/3/bible')
                        .query({access_token: token})
                        .end((err, res) => {
                            if (err) {
                                return next(Boom.serverUnavailable("Can't list translations"), null);
                            }
                            return next(null, JSON.parse(res.text));
                        })
                }
            })
    }

    function bg_version_info(version, next) {
        get_access_token()
            .then(token => {
                if (!token) {
                    return next(Boom.unauthorized('Must authenticate first'), null);
                } else {
                    Request
                        .get(`https://api.biblegateway.com/3/bible/${version}`)
                        .query({access_token: token})
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
    }

    function bg_passage(version, osis, next) {
        get_access_token()
            .then(token => {
                if (!token) {
                    return next(Boom.unauthorized('Must authenticate first'), null);
                } else {
                    Request
                        .get(`https://api.biblegateway.com/3/bible/${osis}/${version}`)
                        .query({access_token: token})
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
    }

    server.method([
        {
            name: 'bg_authenticate',
            method: bg_authenticate,
            options: {}
        },
        {
            name: 'bg_translations',
            method: bg_translations,
            options: {}
        },
        {
            name: 'bg_version_info',
            method: bg_version_info,
            options: {}
        },
        {
            name: 'bg_passage',
            method: bg_passage,
            options: {}
        }
    ]);

    server.route([
        {
            method: 'POST',
            path: '/bg/authenticate',
            config: {
                description: 'Authenticate against the BG API',
                validate: {
                    payload: {
                        username: Joi.string().required().description('BG user name'),
                        password: Joi.string().required().description('BG password')
                    }
                }
            },
            handler: function (request, reply) {
                server.methods.bg_authenticate(request.payload.username, request.payload.password, (err, result) => {
                    if (err) {
                        reply(err);
                    } else {
                        reply(result);
                    }
                });
            }
        },

        {
            method: 'GET',
            path: '/bg/translations',
            config: {
                description: 'Retrieve list of available translations'
            },
            handler: function (request, reply) {
                server.methods.bg_translations((err, result) => {
                    if (err) {
                        reply(err);
                    } else {
                        reply(result);
                    }
                });
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
                }
            },
            handler: function (request, reply) {
                server.methods.bg_version_info(request.params.version, (err, result) => {
                    if (err) {
                        reply(err);
                    } else {
                        reply(result);
                    }
                })
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
                }
            },
            handler: function (request, reply) {
                server.methods.bg_passage(request.params.version, request.params.osis, (err, result) => {
                    if (err) {
                        reply(err);
                    } else {
                        reply(result);
                    }
                })
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'bible_gateway', version: '0.0.1'};
