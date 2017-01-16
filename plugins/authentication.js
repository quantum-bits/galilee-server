'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');

const JWT = require('jsonwebtoken');
const JWT_SECRET_KEY = 'My Super Secret Key';   // TODO: Store in config file!

exports.register = function (server, options, next) {

    function validate(decoded, request, callback) {
        server.log('info', decoded);
        if (decoded.hasOwnProperty('user_id')) {
            User.query()
                .where('id', decoded.user_id)
                .then(users => {
                    if (users.length === 1 && users[0].id === decoded.user_id) {
                        callback(null, true);
                    }
                });
        } else {
            callback(null, false);
        }
    }

    function createToken(email, user_id) {
        return JWT.sign(
            {
                user_id: user_id
            },
            JWT_SECRET_KEY,
            {
                algorithm: 'HS256',
                expiresIn: "1d"
            }
        );
    }

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

                User.query()
                    .where('email', email)
                    .first()
                    .then(user => {
                        if (user && user.checkPassword(password)) {
                            delete user.password;       // Don't send password
                            return reply({
                                status: 'OK',
                                id_token: createToken(email, user.id),
                                user: user
                            });
                        }
                        return reply({
                            status: 'FAIL',
                            message: 'Invalid credentials'
                        });
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
                description: 'Endpoint for testing restricted access',
                auth: 'jwt'
            },
        }
    ]);

    next();
};

exports.register.attributes = {name: 'authentication', version: '0.0.1'};
