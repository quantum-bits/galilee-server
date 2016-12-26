'use strict';

const Boom = require('boom');
const Joi = require('Joi');
const JWT = require('jsonwebtoken');

const JWT_SECRET_KEY = 'My Super Secret Key';   // TODO: Store in config file!

exports.register = function (server, options, next) {

    function validate(decoded, request, callback) {
        server.log('info', 'Validate the user');
        return callback(null, true);
    };

    function createToken() {
        return JWT.sign(
            {
                key: 'a value'
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
                reply({ id_token: createToken()});
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
        }
    ]);

    next();
};

exports.register.attributes = {name: 'authentication', version: '0.0.1'};
