'use strict';

const Boom = require('boom');
const Joi = require('Joi');
const _ = require('lodash');

const User = require('../models/User');
const Permission = require('../models/Permission');

/**
 * Joi schema for user payload.
 */
const userPayloadSchema = {
    email: Joi.string().email(),
    password: Joi.string().min(6),
    firstName: Joi.string(),
    lastName: Joi.string()
}

/**
 * Filter password field from user objet.
 * @param user
 */
function filteredUser(user) {
    return _.omit(user, ['password'])
}

exports.register = function (server, options, next) {

    // Do we have a user with the given e-mail address?
    server.method('userExists', (request, reply) => {
        User.query()
            .where('email', request.payload.email)
            .first()
            .then(user => {
                reply(user !== undefined);
            })
            .catch(err => Boom.badImplementation("Can't fetch user", err));
    });

    server.route([
        {
            method: 'GET',
            path: '/users',
            config: {
                description: 'Retrieve all users',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                User.query()
                    .eager('[permissions, version]')
                    .map(user => filteredUser(user))
                    .then(users => reply(users))
                    .catch(err => Boom.badImplementation("Can't fetch users", err));
            }
        },

        {
            method: 'GET',
            path: '/users/{uid}',
            config: {
                description: 'Retrieve user with given user ID',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                User.query()
                    .where('id', request.params.uid)
                    .eager('[permissions, version]')
                    .first()
                    .then(user => {
                        if (user) {
                            reply(user);
                        } else {
                            reply(Boom.notFound(`No user with ID ${request.params.email}`));
                        }
                    })
                    .catch(err => Boom.badImplementation(err));
            }
        },

        {
            method: 'PUT',
            path: '/users/{uid}',
            config: {
                description: 'Update an existing user',
                pre: ['userExists'],
                validate: {
                    params: {
                        uid: Joi.number().min(1)
                    },
                    payload: userPayloadSchema
                },
                auth: 'jwt'
            },
            handler: (request, reply) => {
                if (!request.pre.userExists) {
                    return reply({
                        ok: false,
                        message: "No such user"
                    });
                }
                console.log('PARAMS', request.params, request.payload);
                User.query()
                    .updateAndFetchById(request.params.uid, request.payload)
                    .eager('[permissions, version]')
                    .then(user => reply({
                        ok: true,
                        message: 'User data updated',
                        user: filteredUser(user)
                    }))
                    .catch(err => Boom.badImplementation(err));
            }
        },

        {
            method: 'GET',
            path: '/users/permissions',
            config: {
                description: 'Fetch all permission types',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                Permission.query()
                    .then(results => reply(results))
                    .catch(err => Boom.badImplementation(err));
            }
        },

        {
            method: 'POST',
            path: '/users/signup',
            config: {
                description: 'Sign up a new user',
                pre: ['userExists'],
                validate: {payload: userPayloadSchema}
            },
            handler: function (request, reply) {
                if (request.pre.userExists) {
                    return reply({
                        ok: false,
                        message: "The e-mail address you've supplied is already in use."
                    });
                }
                User.query()
                    .insert({
                        email: request.payload.email,
                        password: request.payload.password,
                        firstName: request.payload.firstName,
                        lastName: request.payload.lastName
                    })
                    .then(user => {
                        return reply({
                            ok: true,
                            message: 'New user created successfully',
                            user: filteredUser(user)
                        })
                    })
                    .catch(err => Boom.badImplementation(err));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'user', version: '0.0.1'};
