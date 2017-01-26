'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');

exports.register = function (server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/journals/{uid}',
            config: {
                description: 'Return journal entries for user'
            },
            handler: function (request, reply) {
                JournalEntry.query()
                    .select('journal_entry.id', 'timestamp', 'title', 'entry')
                    .innerJoin('user', 'journal_entry.user_id', 'user.id')
                    .where('user.id', request.params.uid)
                    .eager('tags')
                    .then(entries => reply(entries))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/journals/{uid}/tags',
            config: {
                description: 'Return all tags for user',
                auth: 'jwt'
            },
            handler: function(request, reply) {
                User.query()
                    .where('id', request.params.uid)
                    .first()
                    .eager('tags')
                    .then(user => reply(user.tags))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'journal', version: '0.0.1'};
