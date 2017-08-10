'use strict';

const Hapi = require('hapi');
const Path = require('path');
const moment = require('moment');

const User = require('./models/User');

// This function returns a promise that's resolved by the newly configured server.
exports.configureServer = function (masterConfig, bibleService) {

    const server = new Hapi.Server({
        app: {
            config: masterConfig
        },
        debug: {
            request: ['error'],
            log: ['error']
        }
    });

    server.connection({
        port: server.settings.app.config.get('hapi:port'),
        routes: {
            cors: true,         // TODO: This seems too permissive.
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

    // Fetch a user with an arbitrary object as its WHERE clause.
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
        if (email) {
            fetchUser({'email': email}, next);
        } else {
            next(null, null);
        }
    });

    // Fetch a user by ID.
    server.method('getUserById', function (id, next) {
        fetchUser({'id': id}, next);
    });

    // If no callback (as here), returns a promise object
    // (cf. https://hapijs.com/api#serverregisterplugins-options-callback).
    return server.register(
        [
            {register: require('inert')},       // Static files
            {register: require('vision')},      // Templates (needed by tv)
            {register: require('lout')},        // API documentation

            {register: require('hapi-auth-jwt2')},
            {register: require('./plugins/authentication')},

            {register: require('./plugins/admin')},
            {register: require('./plugins/direction')},
            {register: require('./plugins/forum')},
            {register: require('./plugins/journal')},
            {register: require('./plugins/practice')},
            {register: require('./plugins/reading')},
            {register: require('./plugins/reading_day'), options: {bibleService: bibleService}},
            {register: require('./plugins/static')},
            {register: require('./plugins/user')},
            {register: require('./plugins/version'), options: {bibleService: bibleService}},

            // {register: require('./plugins/resource')},

            {
                register: require('tv'),        // Debug console
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
        }
    ).then(() => server);
};

