'use strict';

const Hapi = require('hapi');
const moment = require('moment');
const nconf = require('nconf');

const User = require('./models/User');

module.exports = function (callback) {

    const server = new Hapi.Server({
        app: {
            nconf: nconf.file('./master.conf.json')
        }
    });

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
            {register: require('hapi-auth-jwt2')},
            {register: require('./plugins/authentication')},

            {register: require('./plugins/admin')},
            {register: require('./plugins/bible_gateway')},
            {register: require('./plugins/forum')},
            {register: require('./plugins/practice')},
            {register: require('./plugins/journal')},
            {register: require('./plugins/question')},
            {register: require('./plugins/reading')},
            {register: require('./plugins/reading_day')},
            {register: require('./plugins/application')},
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
