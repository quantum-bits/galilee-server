'use strict';

const Hapi = require('hapi');
const moment = require('moment');
const nconf = require('nconf');

const User = require('./models/User');

module.exports = function (callback) {

    const server = new Hapi.Server();

    // Access the master configuration file.
    server.app.nconf = nconf.file('./master.conf.json');
    console.log("FOO", server.app.nconf.get("bg:username"));

    server.connection({
        port: 3000,
        routes: {
            cors: true
        }
    });

    // Normalize the date parameter.
    server.method('normalizeDate', function (date, next) {
        if (date === 'today') {
            date = moment().format('YYYY-MM-DD');
        }
        next(null, date);
    });

    server.register(
        [
            {register: require('hapi-auth-jwt2')},
            {register: require('./plugins/authentication')},

            {register: require('./plugins/admin')},
            {register: require('./plugins/bible_gateway')},
            {register: require('./plugins/forum')},
            {register: require('./plugins/practice')},
            {register: require('./plugins/journal')},
            {register: require('./plugins/question')},
            {register: require('./plugins/reading')},
            // {register: require('./plugins/resource')},
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

        {
            routes: {
                prefix: '/api'
            }
        },

        err => {
            if (err) {
                throw(err);
            }

            callback(err, server);
        }
    );

};
