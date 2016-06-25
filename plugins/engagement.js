'use strict';

const Boom = require('boom');

const Practice = require('../models/Practice');

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/practices',
        handler: function (request, reply) {
            Practice
                .query()
                .eager('details')
                .then(practices => reply(practices))
                .catch(err => Boom.badImplementation(err));
        }
    });

    next();
};

exports.register.attributes = {name: 'engagement', version: '0.0.1'};
