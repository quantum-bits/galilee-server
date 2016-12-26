'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');

const JWT = require('jsonwebtoken');
const JWT_SECRET_KEY = 'My Super Secret Key';   // TODO: Store in config file!

exports.register = function (server, options, next) {

    function validate(decoded, request, callback) {
        server.log('info', 'Validate the user');
        return callback(null, true);
    };

    function createToken(email) {
        return JWT.sign(
            {
                email: email
            },
            JWT_SECRET_KEY,
            {
                algorithm: 'HS256',
                expiresIn: "1h"
            }
        );
    };

    server.auth.strategy('jwt', 'jwt', {
        key: JWT_SECRET_KEY,
        validateFunc: validate,
        verifyOptions: {algorithms: ['HS256']}
    });

    server.route([
        {
            method: 'POST',
            path: '/authenticate',
            handler: function (request, reply) {
                let email = request.payload.email;
                let password = request.payload.password;

                User
                    .query()
                    .where('email', email)
                    .first()
                    .then(user => user.checkPassword(password))
                    .then(isValid => {
                        if (isValid) {
                            reply({id_token: createToken(email)});
                        } else {
                            reply(Boom.badRequest('Invalid credentials'));
                        }
                    })
                    .catch(err => Boom.badImplementation(err));
            },
            config: {
                description: 'Authenticate user',
                cors: true
            }
        },
        {
            method: 'GET',
            path: '/restricted',
            handler: function (request, reply) {
                reply('Got restricted info');
            },
            config: {
                auth: 'jwt'
            },
        },
        {
            method: 'GET',
            path: '/users',
            handler: function (request, reply) {
                User
                    .query()
                    .then(users => reply(users))
                    .catch(err => Boom.badImplementation("Can't fetch users", err));
            },
            config: {
                description: 'Retrieve all users'
            }
        },
        {
            method: 'GET',
            path: '/users/{email}',
            handler: function (request, reply) {
                User
                    .query()
                    .where('email', request.params.email)
                    .first()
                    .then(user => {
                        if (user) {
                            reply(user);
                        } else {
                            reply(Boom.notFound(`No user with ID ${request.params.email}`));
                        }
                    })
                    .catch(err => Boom.badImplementation(err));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'authentication', version: '0.0.1'};
