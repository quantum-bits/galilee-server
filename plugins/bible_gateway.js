'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Request = require('superagent');
const Rx = require('rx');

exports.register = function (server, options, next) {

    let access_token = null;

    /**
     * Authenticate against the Bible Gateway API
     * @param username
     * @param password
     * @returns {Observable<T>} JSON reply from Bible Gateway
     */
    function authenticate(username, password) {
        return Rx.Observable.create(observer => {
            Request
                .post('https://api.biblegateway.com/3/user/authenticate')
                .type('form')
                .send({username: username, password: password})
                .accept('json')
                .end(function (err, res) {
                    if (err) {
                        observer.onError(err);
                    }
                    observer.onNext(JSON.parse(res.text));
                    observer.onCompleted();
                });
        });
    }

    server.route({
        method: 'POST',
        path: '/bg/authenticate',
        handler: function (request, reply) {
            access_token = null;
            authenticate(request.payload.username, request.payload.password)
                .subscribe(response => {
                    if (response.hasOwnProperty('authentication')) {
                        access_token = response.authentication.access_token;
                        return reply(response);
                    } else {
                        return reply(Boom.unauthorized('Authentication failed'));
                    }
                });
        },
        config: {
            description: 'Authenticate against the BG API',
            validate: {
                payload: {
                    username: Joi.string().required().description('BG user name'),
                    password: Joi.string().required().description('BG password').notes(['Note 1', 'Note 2'])
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/bg/translations',
        handler: function(request, reply) {
            if (!access_token) {
                return reply(Boom.unauthorized('Must authenticate first'));
            }
            Request
                .get('https://api.biblegateway.com/3/bible')
                .query({access_token: access_token})
                .end((err, res) => {
                    if (err) {
                        return reply(Boom.serverUnavailable("Can't list translations"));
                    }
                    return reply(JSON.parse(res.text));
                });
        }
    });

    server.route({
        method: 'GET',
        path: '/bg/translations/{version}',
        handler: function (request, reply) {
            if (!access_token) {
                return reply(Boom.unauthorized('Must authenticate first'));
            }
            Request
                .get(`https://api.biblegateway.com/3/bible/${request.params.version}`)
                .query({access_token: access_token})
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
        handler: function(request, reply) {
            if (!access_token) {
                return reply(Boom.unauthorized('Must authenticate first'));
            }
            Request
                .get(`https://api.biblegateway.com/3/bible/${request.params.osis}/${request.params.version}`)
                .query({access_token: access_token})
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
