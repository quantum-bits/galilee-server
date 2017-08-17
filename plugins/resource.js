"use strict";

const path = require('path');
const uuid = require('uuid');
const debug = require('debug')('resource');

const Promise = require('bluebird');
const fs = require('fs');
const fsMkdir = Promise.promisify(fs.mkdir);
const fsRename = Promise.promisify(fs.rename);
const fsReaddir = Promise.promisify(fs.readdir);

const Boom = require('boom');
const Joi = require('joi');

const masterConfig = require('../master-config');
const License = require('../models/License');
const Resource = require('../models/Resource');

// A `fileId` is a UUID. We store files at the path: /baseDir/xy/rest,
// where `baseDir` omes from the master configuration, `xy` are the
// first two characters of the fileId, and `rest` are the remaining characters.
class FileIdManager {
    constructor() {
        this.baseDir = masterConfig.get('resources:base-dir');

        this.fileId = uuid.v4();
        this.subDir = this.fileId.substr(0, 2);
        this.baseName = this.fileId.substr(2);
    }

    // Return the directory containing the file: /baseDir/xy
    fileIdDir() {
        return path.join(this.baseDir, this.subDir);
    }

    // Return the full path to the file: /baseDir/xy/rest
    fileIdPath() {
        return path.join(this.fileIdDir(), this.baseName);
    }

    // Check whether there is a file for the fileId.
    fileIdExists() {
        return fsReaddir(this.fileIdDir())
            .then(files => {
                return files.find(elt => elt === this.baseName);
            });
    }
}

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
                const uploadPath = request.payload.file.path;
                const fileIdMgr = new FileIdManager();

                return fsMkdir(fileIdMgr.fileIdDir(), 0o750)
                    .then(() => {
                        return fsRename(uploadPath, fileIdMgr.fileIdPath());
                    }).then(() => {
                        return reply({fileId: fileIdMgr.fileId});
                    });
            }
        },

        {
            method: 'POST',
            path: '/resources/metadata/{fileId}',
            config: {
                description: 'Add metadata for an existing resource',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        fileId: Joi.string().uuid().required().description('FileID of resource')
                    },
                    payload: {
                        // stepId: Joi.number().positive().required().description('ID of step for this resource'),
                        // seq: Joi.number().positive().required().description('Sequence within step'),
                        creator: Joi.string().required().description('Person who created this resource'),
                        creationDate: Joi.date().iso(),
                        copyrightDate: Joi.date().iso(),
                        importDate: Joi.date().iso().required().description('Date imported into system'),
                        licenseId: Joi.number().positive().required().description('License ID'),
                        mimeTypeId: Joi.number().positive().required().description('MIME type ID'),
                        mediaTypeId: Joi.number().positive().required().description('Media type ID'),
                        tags: Joi.array().items(Joi.string()),
                        source: Joi.string().required().description('Free-form text regarding source of resource'),
                        title: Joi.string().required().description('Title to display to user'),
                        // description: Joi.string().required().description('Description to display to user'),
                        notes: Joi.string().allow('').description('Arbitrary notes regarding resource'),
                        height: Joi.number().positive().description('Height (pixels) of image, video'),
                        width: Joi.number().positive().description('Width (pixels) of image, video'),
                        medium: Joi.string().allow('').description('Medium of resource (e.g., oil, stone)'),
                        physicalDimensions: Joi.string().allow('').description('Physical size of the actual object, painting'),
                        currentLocation: Joi.string().allow('').description('Location of actual object, painting'),
                        duration: Joi.string().allow('').description('Duration (HH:MM:SS) of video or audio'),
                    }
                }
            },
            handler: function (request, reply) {
                const insertObj = Object.assign({},
                    request.payload,
                    {
                        fileId: request.params.fileId
                    });

                return Resource.query()
                    .insertAndFetch(insertObj)
                    .then(newRow => {
                        return reply(newRow);
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
