'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');
const Permission = require('../models/Permission');
const JournalEntry = require('../models/JournalEntry');

exports.register = function (server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/users',
            handler: function (request, reply) {
                User
                    .query()
                    .eager('permissions')
                    .then(users => reply(users))
                    .catch(err => Boom.badImplementation("Can't fetch users", err));
            },
            config: {
                description: 'Retrieve all users'
            }
        },

        {
            method: 'GET',
            path: '/users/{email}',
            handler: function (request, reply) {
                User
                    .query()
                    .where('email', request.params.email)
                    .eager('permissions')
                    .first()
                    .then(user => {
                        if (user) {
                            reply(user);
                        } else {
                            reply(Boom.notFound(`No user with ID ${request.params.email}`));
                        }
                    })
                    .catch(err => Boom.badImplementation(err));
            },
            config: {
                description: 'Retrieve user with given e-mail address'
            }
        },

        {
            method: 'GET',
            path: '/users/permissions',
            handler: function (request, reply) {
                Permission
                    .query()
                    .then(results => reply(results))
                    .catch(err => Boom.badImplementation(err));
            },
            config: {
                description: 'Fetch all permission types'
            }
        },

        {
            method: 'GET',
            path: '/users/{email}/journal-entries',
            handler: function (request, reply) {
                JournalEntry.query()
                    .select('journal_entry.id', 'timestamp', 'title', 'entry')
                    .innerJoin('user', 'journal_entry.user_id', 'user.id')
                    .where('email', request.params.email)
                    .then(entries => {
                        return reply({
                            ok: true,
                            entries: entries
                        });
                    })
                    .catch(err => {
                        return reply({
                            ok: false,
                            error: err
                        });
                    })
            },
            config: {
                description: 'Return journal entries for user'
            }
        },

        {
            method: 'POST',
            path: '/users/signup',
            handler: function (request, reply) {
                User.query()
                    .insert({
                        email: request.payload.email,
                        password: request.payload.password,
                        first_name: request.payload.first_name,
                        last_name: request.payload.last_name
                    })
                    .then(user => {
                        return reply({
                            ok: true,
                            user: user
                        })
                    })
                    .catch(err => {
                        return reply({
                            ok: false,
                            error: err
                        })
                    });
            },
            config: {
                description: 'Sign up a new user'
            }

        }
    ]);

    next();
};

exports.register.attributes = {name: 'user', version: '0.0.1'};
