'use strict';

const Hapi = require('hapi');

const User = require('./models/User');

module.exports = function (callback) {

    const server = new Hapi.Server();

    server.connection({
        port: 3000,
        routes: {
            cors: true
        }
    });

    // Fetch a user by e-mail address.
    server.method('getUserByEmail', function (email, next) {
        User.query()
            .where('email', email)
            .first()
            .then(user => {
                next(null, user);
            })
            .catch(err => next(err, null));
    });

    // Fetch a user by ID.
    server.method('getUserById', function (id, next) {
        User.query()
            .where('id', id)
            .first()
            .then(user => {
                console.log("USER", user);
                next(null, user);
            })
            .catch(err => next(err, null));
    });


    server.register(
        [
            {register: require('hapi-auth-jwt2')},
            {register: require('./plugins/authentication')},

            {register: require('./plugins/admin')},
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
