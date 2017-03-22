'use strict';

const Hapi = require('hapi');
const Path = require('path');
const moment = require('moment');
const debug = require('debug')('server');

const BibleService = require('./lib/bible');
const User = require('./models/User');

// Initialize services required by the server, then the server itself. Returns
// a promise that resolves to the Hapi server.
exports.initializeServer = function () {
    const masterConfig = require('./master-config');

    return new BibleService(masterConfig).then(bibleService => {
        debug("%O", bibleService);
        return configureServer(masterConfig, bibleService)
    });
};

// This function returns a promise that's resolved by the newly configured server.
function configureServer(masterConfig, bibleService) {

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

    return server.register(
        [
            {register: require('inert')},       // Static files
            {register: require('vision')},      // Templates (needed by tv)
            {register: require('lout')},        // API documentation

            {register: require('hapi-auth-jwt2')},
            {register: require('./plugins/authentication')},

            {register: require('./plugins/admin')},
            {register: require('./plugins/application')},
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
        }

        // If no callback (as here), returns a promise object
        // (cf. https://hapijs.com/api#serverregisterplugins-options-callback).
    ).then(() => server);
}
