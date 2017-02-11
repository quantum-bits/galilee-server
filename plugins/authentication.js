'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const JWT = require('jsonwebtoken');

const User = require('../models/User');

exports.register = function (server, options, next) {

    const JWT_SECRET_KEY = server.app.nconf.get('jwt-key');

    function validate(decoded, request, callback) {
        if (decoded.hasOwnProperty('userId')) {
            User.query()
                .where('id', decoded.userId)
                .first()
                .then(user => {
                    if (user) {
                        callback(null, true, user);
                    } else {
                        callback(null, false);
                    }
                })
                .catch(err => callback(err, false));
        } else {
            callback(null, false);
        }
    }

    function createToken(email, userId) {
        return JWT.sign(
            {userId: userId},
            JWT_SECRET_KEY,
            {algorithm: 'HS256', expiresIn: "1d"}
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
            config: {
                description: 'Authenticate to server',
                validate: {
                    payload: {
                        email: Joi.string().email().required().description('User e-mail address'),
                        password: Joi.string().min(6).required().description('User password')
                    }
                }
            },
            handler: function (request, reply) {
                let email = request.payload.email;
                let password = request.payload.password;
                console.log("EMAIL", email, "PASS", password);

                // TODO: Refactor to use existing server method (getUserByEmail).
                User.query()
                    .where('email', email)
                    .eager('permissions')
                    .first()
                    .then(user => {
                        if (user) {
                            user.checkPassword(password)
                                .then(isValid => {
                                    if (isValid) {
                                        delete user.password;       // Don't send password.
                                        reply({
                                            jwtIdToken: createToken(email, user.id),
                                            user: user
                                        });
                                    } else {
                                        reply(Boom.unauthorized('Authentication failed'));
                                    }
                                });
                        } else {
                            reply(Boom.unauthorized('Authentication failed'));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'authentication', version: '0.0.1'};
