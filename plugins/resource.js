"use strict";

const path = require('path');
const uuid = require('uuid');
const debug = require('debug')('resource');

const Promise = require('bluebird');
const fs = require('fs');
const fsMkdir = Promise.promisify(fs.mkdir);
const fsRename = Promise.promisify(fs.rename);

const Boom = require('boom');
const Joi = require('joi');

const Config = require('../models/Config');
const License = require('../models/License');
const Resource = require('../models/Resource');

exports.register = function (server, options, next) {

    const extensionRe = /^\.(?:gif|jpe?g|png)$/;

    server.route([

        {
            method: 'POST',
            path: '/resources/uploads',
            config: {
                description: 'Upload a new resource',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                payload: {
                    parse: true,
                    output: 'file'
                },
                validate: {
                    payload: {
                        file: Joi.any().required().description('File being uploaded'),
                    }
                }
            },
            handler: function (request, reply) {
                debug("PAYLOAD %O", request.payload);
                const uploadName = path.basename(request.payload.file.filename);

                const uploadExtension = path.extname(uploadName);
                if (!extensionRe.test(uploadExtension)) {
                    return reply(Boom.badData('Invalid file type'));
                }

                const uploadPath = request.payload.file.path;

                Config.query()
                    .where('key', 'upload-root')
                    .first()
                    .then(result => {
                        const uploadRoot = result.value;
                        const uniqueId = uuid.v4();
                        const destination = path.join(__dirname,
                            uploadRoot,
                            uniqueId.substr(0, 2),
                            uniqueId.substr(2) + uploadExtension);
                        const destDir = path.dirname(destination);
                        debug('destDir %O');

                        return fsMkdir(destDir, 0o750)
                            .then(() => {
                                return fsRename(uploadPath, destination);
                            }).then(() => {
                                return reply({fileId: uniqueId});
                            });
                    });
            }
        },

        {
            method: 'POST',
            path: '/resources',
            config: {
                description: 'Add a new resource',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                payload: {
                    parse: true,
                    output: 'file'
                },
                validate: {
                    payload: {
                        file: Joi.any().required().description('File being uploaded'),
                        stepId: Joi.number().positive().required().description('ID of step for this resource'),
                        seq: Joi.number().positive().required().description('Sequence within step'),
                        creator: Joi.string().required().description('Person who created this resource'),
                        creationDate: Joi.date().iso(),
                        copyrightDate: Joi.date().iso(),
                        importDate: Joi.date().iso().required().description('Date imported into system'),
                        licenseType: Joi.number().positive().required().description('License ID'),
                        mimeType: Joi.number().positive().required().description('MIME type ID'),
                        mediaType: Joi.number().positive().required().description('Media type ID'),
                        keywords: Joi.array().items(Joi.string()),
                        source: Joi.string().required().description('Free-form text regarding source of resource'),
                        title: Joi.string().required().description('Title to display to user'),
                        description: Joi.string().required().description('Description to display to user'),
                        notes: Joi.string().description('Arbitrary notes regarding resource'),
                        height: Joi.number().positive().description('Height (pixels) of image, video'),
                        width: Joi.number().positive().description('Width (pixels) of image, video'),
                        medium: Joi.string().description('Medium of resource (e.g., oil, stone)'),
                        physicalDimensions: Joi.string().description('Physical size of the actual object, painting'),
                        currentLocation: Joi.string().description('Location of actual object, painting'),
                        duration: Joi.string().description('Duration (HH:MM:SS) of video or audio'),
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
                debug("PAYLOAD %O", request.payload);
                const uploadName = path.basename(request.payload.file.filename);

                const uploadExtension = path.extname(uploadName);
                if (!extensionRe.test(uploadExtension)) {
                    return reply(Boom.badData('Invalid file type'));
                }

                const uploadPath = request.payload.file.path;

                Config.query()
                    .where('key', 'upload-root')
                    .first()
                    .then(result => {
                        const uploadRoot = result.value;
                        const uniqueId = uuid.v4();
                        const destination = path.join(__dirname,
                            uploadRoot,
                            uniqueId.substr(0, 2),
                            uniqueId.substr(2) + uploadExtension);
                        const destDir = path.dirname(destination);
                        debug('destDir %O');

                        return fsMkdir(destDir, 0o750)
                            .then(() => {
                                return fsRename(uploadPath, destination);
                            }).then(() => {
                                return Resource.query()
                                    .insertAndFetch({
                                        id: uniqueId,
                                        caption: request.payload.caption,
                                        copyrightYear: request.payload.year,
                                        copyrightOwner: request.payload.owner,
                                        details: {
                                            filename: uploadName
                                        },
                                        resourceTypeId: request.payload.typeId
                                    });
                            }).then(newRow => {
                                return reply(newRow);
                            });
                    });
            }
        },

        {
            method: 'GET',
            path: '/resources/licenses',
            config: {
                description: 'List available licenses',
                auth: {
                    strategy: 'jwt',
                }
            },
            handler: function (request, reply) {
                License.query()
                    .then(licenses => reply(licenses));
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'resources', version: '0.0.1'};
