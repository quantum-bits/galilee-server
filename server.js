'use strict';

const Hapi = require('hapi');
const Path = require('path');
const moment = require('moment');

const User = require('./models/User');

module.exports = function (callback) {

    const server = new Hapi.Server({
        app: {
            config: require('./master-config')
        }
    });

    server.connection({
        port: server.settings.app.config.get('hapi:port'),
        routes: {
            cors: true,
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    });

    // Normalize the date parameter.
    server.method('normalizeDate', function (date, next) {
        if (date === 'today') {
            date = moment().format('YYYY-MM-DD');
        }
        next(null, date);
    });

    // Fetch a user with arbitrary object as where clause.
    function fetchUser(whereClause, next) {
        User.query()
            .where(whereClause)
            .eager('[permissions,groups]')
            .first()
            .then(user => next(null, user))
            .catch(err => next(err, null));
    }

    // Fetch a user by e-mail address.
    server.method('getUserByEmail', function (email, next) {
        fetchUser({'email': email}, next);
    });

    // Fetch a user by ID.
    server.method('getUserById', function (id, next) {
        fetchUser({'id': id}, next);
    });

    server.register(
        [
            {register: require('inert')},       // Static files
            {register: require('vision')},      // Templates (needed by tv)
            {register: require('lout')},        // API documentation

            {register: require('hapi-auth-jwt2')},
            {register: require('./plugins/authentication')},

            {register: require('./plugins/admin')},
            {
                register: require('./plugins/bible_gateway'),
                options: {
                    username: server.settings.app.config.get('bg:username'),
                    password: server.settings.app.config.get('bg:password')
                }
            },
            {register: require('./plugins/forum')},
            {register: require('./plugins/practice')},
            {register: require('./plugins/journal')},
            {register: require('./plugins/question')},
            {register: require('./plugins/reading')},
            {register: require('./plugins/reading_day')},
            {register: require('./plugins/application')},
            // {register: require('./plugins/resource')},
            {register: require('./plugins/user')},
            {register: require('./plugins/version')},

            {
                register: require('tv'),        // Documentation
                options: {
                    host: 'localhost',
                    port: 2020
                }
            },

            {
                register: require('blipp'),     // Route listing
                options: {
                    showStart: true,
                    showAuth: true
                }
            },

            {
                register: require('good'),      // Logging
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

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true
            }
        }
    });
};
