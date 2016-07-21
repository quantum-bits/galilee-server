'use strict';

const Boom = require('boom');

const Lection = require('../models/Lection');

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/lection',
        handler: function (request, reply) {
            Lection
                .query()
                .first()
                .eager('[type, readings.[type, pericopes.passages]]')
                .then(lection => reply(lection.jsonReadings()))
                .catch(err => Boom.badImplementation(err));
        }
    });

    next();
};

exports.register.attributes = {name: 'lection', version: '0.0.1'};
