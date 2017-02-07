'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const Practice = require('../models/Practice');

exports.register = function (server, options, next) {

    server.method('readPractice', function (id, next) {
        Practice.query()
            .findById(id)
            .then(result => next(null, result))
            .catch(err => next(err, null));
    });

    server.route([
        {
            method: 'GET',
            path: '/practices',
            config: {
                description: 'Get all practices',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                Practice.query()
                    .then(practices => reply(practices))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/practices/{id}',
            config: {
                description: 'Get a single practice',
                auth: 'jwt',
                pre: [
                    {assign: 'practice', method: 'readPractice(params.id)'}
                ],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required().description('Practice ID')
                    }
                }
            },
            handler: function (request, reply) {
                if (!request.pre.practice) {
                    reply(Boom.notFound(`No practice with ID ${request.params.id}`));
                } else {
                    reply(request.pre.practice);
                }
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'practice', version: '0.0.1'};
