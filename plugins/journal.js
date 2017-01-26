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
            handler: function (request, reply) {
                JournalEntry.query()
                    .select('journal_entry.id', 'timestamp', 'title', 'entry')
                    .innerJoin('user', 'journal_entry.user_id', 'user.id')
                    .where('user.id', request.params.uid)
                    .eager('tags')
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
        }
    ]);

    next();
};

exports.register.attributes = {name: 'journal', version: '0.0.1'};
