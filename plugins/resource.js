"use strict";

const path = require('path');
const fs = require('fs');

const Boom = require('boom');

exports.register = function(server, options, next) {
    
    server.route({
        method: 'POST',
        path: '/resources',
        handler: function(request, reply) {
            const uploadName = path.basename(request.payload.file.filename);
            const uploadPath = request.payload.file.path;
            const destination = path.join(__dirname, '../resources', uploadName);

            server.log('info', `upload name ${uploadName}`);
            server.log('info', `upload path ${uploadPath}`);
            server.log('info', `destination ${destination}`);

            fs.rename(uploadPath, destination, err => {
                if (err) {
                    reply(Boom.badImplementation("Can't rename uploaded file", err));
                }

                reply('ok');
            });
        },
        config: {
            payload: {
                parse: true,
                output: 'file'
            },
            cors: {
                origin: ['http://localhost:4200'],
                credentials: true
            }
        }
    });
    

    next();
};

exports.register.attributes = { name: 'resources', version: '0.0.1' };
