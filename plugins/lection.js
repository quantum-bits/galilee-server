'use strict';

exports.register = function(server, options, next) {

    server.route({
        method: 'GET',
        path: '/lection',
        handler: function(request, reply) {
            reply('Hello, lection');
        }
    });

    next();
};

exports.register.attributes = { name: 'lection', version: '0.0.1' };
