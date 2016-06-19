'use strict';

const Hapi = require('hapi');

module.exports = function (callback) {

    const server = new Hapi.Server();

    server.connection({
        port: 3000
    });

    server.register(
        [
            {register: require('./plugins/lection')},

            {
                register: require('good'),
                options: {
                    reporters: {
                        console: [
                            {
                                module: 'good-console',
                                args: [{
                                    response: '*',
                                    log: '*'
                                }]
                            }
                        ]
                    }
                }
            }
        ],

        err => callback(err, server)
    );

};
