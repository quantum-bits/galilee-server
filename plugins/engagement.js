'use strict';

const Boom = require('boom');

const Practice = require('../models/Practice');

exports.register = function (server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/practices',
            handler: function (request, reply) {
                Practice
                    .query()
                    .eager('details')
                    .then(practices => reply(practices))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/practices/{id}',
            handler: function (request, reply) {
                Practice
                    .query()
                    .eager('details')
                    .where('id', request.params.id)
                    .first()
                    .then(practice => {
                        if (practice) {
                            reply(practice);
                        } else {
                            reply(Boom.notFound(`No practice with ID ${request.params.id}`));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'engagement', version: '0.0.1'};
