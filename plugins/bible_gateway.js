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

    server.route({
        method: 'POST',
        path: '/bg/authenticate',
        handler: function (request, reply) {
            delete_access_token().then(() => {
                Request
                    .post('https://api.biblegateway.com/3/user/authenticate')
                    .type('form')
                    .send({username: request.payload.username, password: request.payload.password})
                    .accept('json')
                    .end(function (err, res) {
                        if (err) {
                            return reply(Boom.serverUnavailable("Can't authenticate"));
                        }
                        const response = JSON.parse(res.text);
                        if (response.hasOwnProperty('authentication')) {
                            insert_access_token(response.authentication.access_token).then(tuple => {
                                return reply(response);
                            })
                        } else {
                            return reply(Boom.unauthorized('Authentication failed'));
                        }
                    });
            });
        },
        config: {
            description: 'Authenticate against the BG API',
            validate: {
                payload: {
                    username: Joi.string().required().description('BG user name'),
                    password: Joi.string().required().description('BG password')
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/bg/translations',
        handler: function (request, reply) {
            get_access_token()
                .then(token => {
                    if (!token) {
                        return reply(Boom.unauthorized('Must authenticate first'));
                    } else {
                        Request
                            .get('https://api.biblegateway.com/3/bible')
                            .query({access_token: token})
                            .end((err, res) => {
                                if (err) {
                                    return reply(Boom.serverUnavailable("Can't list translations"));
                                }
                                return reply(JSON.parse(res.text));
                            });
                    }
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/bg/translations/{version}',
        handler: function (request, reply) {
            get_access_token()
                .then(token => {
                    if (!token) {
                        return reply(Boom.unauthorized('Must authenticate first'));
                    } else {
                        Request
                            .get(`https://api.biblegateway.com/3/bible/${request.params.version}`)
                            .query({access_token: token})
                            .end((err, res) => {
                                if (err) {
                                    return reply(Boom.serverUnavailable("Can't get version information"));
                                }
                                const response = JSON.parse(res.text);
                                if (!response.hasOwnProperty('data')) {
                                    return reply(Boom.badData('Invalid version name'));
                                }
                                return reply(response);
                            });
                    }
                });
        },
        config: {
            validate: {
                params: {
                    version: Joi.string().required()
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/bg/translations/{version}/{osis}',
        handler: function (request, reply) {
            get_access_token()
                .then(token => {
                    if (!token) {
                        return reply(Boom.unauthorized('Must authenticate first'));
                    } else {
                        Request
                            .get(`https://api.biblegateway.com/3/bible/${request.params.osis}/${request.params.version}`)
                            .query({access_token: token})
                            .end((err, res) => {
                                if (err) {
                                    return reply(Boom.serverUnavailable("Can't get passage"));
                                }
                                const response = JSON.parse(res.text);
                                if (!response.hasOwnProperty('data')) {
                                    return reply(Boom.badData('Invalid version or passage'));
                                }
                                return reply(response);
                            });
                    }
                });
        },
        config: {
            validate: {
                params: {
                    version: Joi.string().required(),
                    osis: Joi.string().required()
                }
            }
        }
    });


    next();
};

exports.register.attributes = {name: 'bible_gateway', version: '0.0.1'};
