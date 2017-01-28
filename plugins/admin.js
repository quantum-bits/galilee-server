'use strict';

const Boom = require('boom');
const Joi = require('Joi');
const _ = require('lodash');

const User = require('../models/User');

exports.register = function (server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/admin/users',
            config: {
                description: 'Retrieve all users'
            },
            handler: function (request, reply) {
                User.query()
                    .eager('[permissions, version]')
                    .orderBy('id')
                    .then(users => reply(users))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'admin', version: '0.0.1'};
