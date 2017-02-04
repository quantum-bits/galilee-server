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

    const extensionRe = /^\.(?:gif|jpe?g|png)$/;

    server.route([

        {
            method: 'GET',
            path: '/collections',
            config: {
                description: 'Retrieve all collections'
            },
            handler: function (request, reply) {
                Collection
                    .query()
                    .then(collections => reply(collections))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'POST',
            path: '/collections',
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
            },
            handler: function (request, reply) {
                const uniqueId = uuid.v4();

                Collection.query()
                    .insert({
                        id: uniqueId,
                        title: request.payload.title,
                        description: request.payload.description
                    })
                    .then(() => reply({collectionId: uniqueId}))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'POST',
            path: '/resources',
            config: {
                description: 'Add a new resource',
                payload: {
                    parse: true,
                    output: 'file'
                },
                validate: {
                    payload: {
                        file: Joi.any().required().description('File being uploaded'),
                        caption: Joi.string().required().description('Caption for file'),
                        year: Joi.number().positive().min(1900).description('Copyright year'),
                        owner: Joi.string().description('Copyright owner'),
                        collectionId: Joi.string().guid().required().description('Resource collection ID'),
                        typeId: Joi.number().positive().required().description('Resource type ID')
                    }
                },
                response: {
                    schema: {
                        status: Joi.string().valid(['ok']).required(),
                        resourceId: Joi.string().guid().required()
                    }
                }
            },
            handler: function (request, reply) {
                const uploadName = path.basename(request.payload.file.filename);

                const uploadExtension = path.extname(uploadName);
                if (!extensionRe.test(uploadExtension)) {
                    return reply(Boom.badData('Invalid file type'));
                }

                const uploadPath = request.payload.file.path;

                Config.query()
                    .where('key', 'upload-root').first()
                    .then(result => {
                        const uploadRoot = result.value;
                        const uniqueId = uuid.v4();
                        const destination = path.join(__dirname, uploadRoot,
                            uniqueId.substr(0, 2),
                            uniqueId + uploadExtension);
                        const destDir = path.dirname(destination);

                        fs.mkdir(destDir, 0o750, err => {
                            fs.rename(uploadPath, destination, err => {
                                if (err) {
                                    return reply(Boom.badImplementation("Can't rename uploaded file", err));
                                }

                                Resource.query().insert({
                                    id: uniqueId,
                                    caption: request.payload.caption,
                                    copyrightYear: request.payload.year,
                                    copyrightOwner: request.payload.owner,
                                    details: {
                                        filename: uploadName
                                    },
                                    resourceTypeId: request.payload.typeId
                                }).then(resource => {
                                    return resource
                                        .$relatedQuery('collections')
                                        .relate(request.payload.collectionId)
                                }).then(() => {
                                    return reply({
                                        status: 'ok',
                                        resourceId: uniqueId
                                    });
                                }).catch(err => reply(Boom.badImplementation('Problem with upload', err)));
                            });     // rename
                        });         // mkdir
                    });             // query
            }
        },

        {
            method: 'GET',
            path: '/resources/types',
            handler: function (request, reply) {
                ResourceType
                    .query()
                    .then(types => reply(types))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'resources', version: '0.0.1'};
