'use strict';

const Boom = require('boom');
const Joi = require('joi');

const JWT = require('jsonwebtoken');

const User = require('../models/User');

exports.register = function (server, options, next) {

    const JWT_SECRET_KEY = server.settings.app.config.get('jwt-key');

    function validate(decoded, request, callback) {
        if (decoded.hasOwnProperty('userId')) {
            server.methods.getUserById(decoded.userId, (err, user) => {
                if (err) {
                    callback(null, false);
                } else {
                    let scopes = user.permissions.map(perm => perm.id.toLowerCase())
                    let credentials = Object.assign(user, {scope: scopes});
                    callback(null, true, credentials);
                }
            });
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
                },
                pre: [
                    {assign: 'user', method: 'getUserByEmail(payload.email)'}
                ]
            },
            handler: function (request, reply) {
                const email = request.payload.email;
                const password = request.payload.password;
                const user = request.pre.user;

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
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'authentication', version: '0.0.1'};
