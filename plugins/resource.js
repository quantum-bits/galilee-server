"use strict";

const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const Boom = require('boom');
const Joi = require('Joi');

const Resource = require('../models/Resource');
const ResourceType = require('../models/ResourceType');
const Collection = require('../models/Collection');
const Config = require('../models/Config');

exports.register = function (server, options, next) {

    const extension_re = /^\.(?:gif|jpe?g|png)$/;

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
        path: '/collections',
        handler: function (request, reply) {
            const unique_id = uuid.v4();

            Collection.query()
                .insert({
                    id: unique_id,
                    title: request.payload.title,
                    description: request.payload.description
                })
                .then(() => {
                    reply({
                        status: 'ok',
                        collectionId: unique_id
                    });
                })
                .catch(err => reply(Boom.badImplementation("Can't insert collection", err)));
        },
        config: {
            description: 'Add a new collection',
            validate: {
                payload: {
                    title: Joi.string().required().description('Title'),
                    description: Joi.string().required().description('Description')
                }
            },
            response: {
                schema: {
                    status: Joi.string().valid(['ok']).required(),
                    collectionId: Joi.string().guid().required()
                }
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/resources',
        handler: function (request, reply) {
            const uploadName = path.basename(request.payload.file.filename);

            const uploadExtension = path.extname(uploadName);
            if (!extension_re.test(uploadExtension)) {
                return reply(Boom.badData('Invalid file type'));
            }

            const uploadPath = request.payload.file.path;

            Config.query()
                .where('key', 'upload-root').first()
                .then(result => {
                    const upload_root = result.value;
                    const unique_id = uuid.v4();
                    const destination = path.join(__dirname, upload_root,
                        unique_id.substr(0, 2),
                        unique_id + uploadExtension);
                    const dest_dir = path.dirname(destination);

                    fs.mkdir(dest_dir, 0o750, err => {
                        fs.rename(uploadPath, destination, err => {
                            if (err) {
                                return reply(Boom.badImplementation("Can't rename uploaded file", err));
                            }

                            Resource.query().insert({
                                id: unique_id,
                                caption: request.payload.caption,
                                copyright_year: request.payload.year,
                                copyright_owner: request.payload.owner,
                                details: {
                                    filename: uploadName
                                },
                                resource_type_id: request.payload.typeId
                            }).then(resource => {
                                return resource
                                    .$relatedQuery('collections')
                                    .relate(request.payload.collectionId)
                            }).then(() => {
                                return reply({
                                    status: 'ok',
                                    resourceId: unique_id
                                });
                            }).catch(err => reply(Boom.badImplementation('Problem with upload', err)));
                        });     // rename
                    });         // mkdir
                });             // query
        },
        config: {
            description: 'Add a new resource',
            payload: {
                parse: true,
                output: 'file'
            }
            ,
            validate: {
                payload: {
                    file: Joi.any().required().description('File being uploaded'),
                    caption: Joi.string().required().description('Caption for file'),
                    year: Joi.number().positive().min(1900).description('Copyright year'),
                    owner: Joi.string().description('Copyright owner'),
                    collectionId: Joi.string().guid().required().description('Resource collection ID'),
                    typeId: Joi.number().positive().required().description('Resource type ID')
                }
            }
            ,
            response: {
                schema: {
                    status: Joi.string().valid(['ok']).required(),
                    resourceId: Joi.string().guid().required()
                }
            }
            ,
            cors: {
                origin: ['http://localhost:4200'],
                credentials: true
            }
        }
    })
    ;

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
};

exports.register.attributes = {name: 'resources', version: '0.0.1'};
