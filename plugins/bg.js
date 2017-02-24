'use strict';

const Joi = require('joi');

exports.register = function (server, options, next) {

    const bibleService = options.bibleService;

    server.route([
        {
            method: 'GET',
            path: '/bg/versions',
            config: {
                description: 'Retrieve list of available versions'
            },
            handler: function (request, reply) {
                bibleService
                    .getAuthorizedVersions()
                    .then(versions => reply(versions))
                    .catch(err => new Error(err));
            }
        },

        {
            method: 'GET',
            path: '/bg/versions/{version}',
            config: {
                description: 'Retrieve version information',
                validate: {
                    params: {
                        version: Joi.string().required()
                    }
                }
            },
            handler: function (request, reply) {
                bibleService
                    .getVersionInfo(request.params.version)
                    .then(versionInfo => reply(versionInfo))
                    .catch(err => new Error(err));
            }
        },

        {
            method: 'GET',
            path: '/bg/passage/{version}/{osis}',
            config: {
                description: 'Fetch scripture passage',
                validate: {
                    params: {
                        version: Joi.string().required(),
                        osis: Joi.string().required()
                    }
                }
            },
            handler: function (request, reply) {
                bibleService
                    .getPassage(request.params.version, request.params.osis)
                    .then(passage => reply(passage));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'bg', version: '0.0.3'};
