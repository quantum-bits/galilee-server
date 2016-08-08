"use strict";

const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const Boom = require('boom');
const Joi = require('Joi');

const ResourceType = require('../models/ResourceType');
const Collection = require('../models/Collection');
const Config = require('../models/Config');

exports.register = function (server, options, next) {

    const upload_root_promise = Config
        .query()
        .where('key', 'upload-root')
        .first()
        .then(result => result.value)
        .catch(err => Boom.badImplementation("No upload root configured", err));

    server.route({
        method: 'GET',
        path: '/collections',
        handler: function (request, reply) {
            Collection
                .query()
                .then(collections => reply(collections))
                .catch(err => Boom.badImplementation("Can't fetch collections", err));

        },
        config: {
            description: 'Retrieve all collections'
        }
    });

    server.route({
        method: 'POST',
        path: '/resources',
        handler: function (request, reply) {
            const uploadName = path.basename(request.payload.file.filename);
            const uploadPath = request.payload.file.path;

            Config.query()
                .where('key', 'upload-root')
                .first()
                .then(result => {
                    const upload_root = result.value;
                    const destination = path.join(__dirname, upload_root, uploadName);
                    const unique_id = uuid.v4();

                    server.log('info', `upload name ${uploadName}`);
                    server.log('info', `upload path ${uploadPath}`);
                    server.log('info', `destination ${destination}`);
                    server.log('info', `uuid        ${unique_id}`);

                    fs.rename(uploadPath, destination, err => {
                        if (err) {
                            reply(Boom.badImplementation("Can't rename uploaded file", err));
                        }

                        reply({
                            status: 'ok',
                            resourceId: unique_id
                        });
                    });
                });

        },
        config: {
            description: 'Add a new resource',
            payload: {
                parse: true,
                output: 'file'
            },
            validate: {
                payload: {
                    file: Joi.any().required().description('File being uploaded'),
                    collectionId: Joi.number().required().description('Resource collection ID')
                }
            },
            response: {
                schema: {
                    status: Joi.string().valid(['ok']).required(),
                    resourceId: Joi.string().guid().required()
                }
            },
            cors: {
                origin: ['http://localhost:4200'],
                credentials: true
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/resources/types',
        handler: function (request, reply) {
            ResourceType
                .query()
                .then(types => reply(types))
                .catch(err => Boom.badImplementation("Can't fetch resource types", err));
        }
    });

    next();
}
;

exports.register.attributes = {name: 'resources', version: '0.0.1'};
