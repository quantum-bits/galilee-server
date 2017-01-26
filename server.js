'use strict';

const Hapi = require('hapi');

module.exports = function (callback) {

    const server = new Hapi.Server();

    server.connection({
        port: 3000,
        routes: {
            cors: true
        }
    });

    // Check that the user in the JWT matches the user in the URL.
    server.method('userMatches', (request, reply) => {
        let credId = +(request.auth.credentials.id);
        let reqId = +(request.params.id);
        reply(credId === reqId);
    });

    server.register(
        [
            {register: require('hapi-auth-jwt2')},
            {register: require('./plugins/authentication')},

            {register: require('./plugins/bible_gateway')},
            {register: require('./plugins/engagement')},
            {register: require('./plugins/journal')},
            {register: require('./plugins/reading')},
            {register: require('./plugins/resource')},
            {register: require('./plugins/user')},

            {register: require('vision')},
            {register: require('inert')},
            {register: require('lout')},

            {
                register: require('tv'),
                options: {
                    host: 'localhost',
                    port: 2020
                }
            },

            {
                register: require('blipp'),
                options: {
                    showStart: true,
                    showAuth: true
                }
            },

            {
                register: require('good'),
                options: {
                    reporters: {
                        console: [
                            {
                                module: 'good-squeeze',
                                name: 'Squeeze',
                                args: [{log: '*', response: '*'}]
                            },
                            {
                                module: 'good-console'
                            },
                            'stdout'
                        ]
                    }
                }
            }
        ],

        err => {
            if (err) {
                throw(err);
            }

            callback(err, server);
        }
    );

};
