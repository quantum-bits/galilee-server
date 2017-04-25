'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Version = require('../models/Version');

exports.register = function (server, options, next) {

    const bibleService = options.bibleService;

    server.route([

        // No 'POST' route -- it's up to BG which versions we can use.

        {
            method: 'GET',
            path: '/versions',
            config: {
                description: "Get all versions"
            },
            handler: function (request, reply) {
                reply(bibleService.getAuthorizedVersions());
            }
        },

        {
            method: 'GET',
            path: '/versions/{id}',
            config: {
                description: "Get a version by id",
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading ID')
                    }
                }
            },
            handler: function (request, reply) {
                reply(bibleService.findVersionById(request.params.id));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'version', version: '0.0.1'};
