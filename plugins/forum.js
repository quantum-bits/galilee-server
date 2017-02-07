'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const moment = require('moment');

const Post = require('../models/Post');

exports.register = function (server, options, next) {

    const idValidator = {
        id: Joi.number().integer().min(1).required().description('Post ID'),
    };

    const idPartialValidator = Joi.number().integer().min(1);

    const postValidators = {
        title: Joi.string().description('Post title'),
        content: Joi.string().required().description('Post content'),
        parentPostId: idPartialValidator.description('ID of parent post'),
        userId: idPartialValidator.required().description('ID of user who posted'),
        groupId: idPartialValidator.required().description('ID of group for this post'),
        readingId: idPartialValidator.description('ID of associated reading')
    };

    server.method('getPost', function (postId, next) {
        Post.query()
            .findById(postId)
            .then(post => next(null, post))
            .catch(err => next(err, null));
    });

    server.route([

        {
            method: 'GET',
            path: '/posts',
            config: {
                description: 'Search for posts',
                auth: 'jwt',
                validate: {
                    query: {
                        userId: idPartialValidator.description('User who made post'),
                        groupId: idPartialValidator.description('Group that owns post')
                    }
                }
            },
            handler: function (request, reply) {
                let postQuery = Post.query();

                if (request.query.userId) {
                    postQuery.where('userId', request.query.userId);
                } else if (request.query.groupId) {
                    postQuery.where('groupId', request.query.groupId);
                } else {
                    return reply(Boom.badRequest('No search criterion'));
                }

                postQuery
                    .then(posts => reply(posts))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        /* TODO: Uncomment and complete.
         {
         method: 'POST',
         path: '/posts',
         config: {
         description: 'New daily post',
         auth: 'jwt',
         validate: {
         payload: postValidators
         }
         },
         handler: function (request, reply) {
         Post.query()
         .insert({
         text: request.payload.text,
         seq: request.payload.seq,
         readingDayId: request.payload.readingDayId
         })
         .returning('*')
         .then(post => reply(post))
         .catch(err => reply(Boom.badImplementation(err)));
         }
         },

         {
         method: 'GET',
         path: '/posts/{id}',
         config: {
         description: 'Fetch a post',
         auth: 'jwt',
         pre: [
         {assign: 'post', method: 'getPost(params.id)'}
         ],
         validate: {
         params: idValidator
         }
         },
         handler: function (request, reply) {
         if (request.pre.post) {
         reply(request.pre.post);
         } else {
         reply(Boom.notFound(`No post with ID ${request.params.id}`));
         }
         }
         },

         {
         method: 'PATCH',
         path: '/posts/{id}',
         config: {
         description: 'Update a post',
         auth: 'jwt',
         pre: [
         {assign: 'post', method: 'getPost(params.id)'}
         ],
         validate: {
         params: idValidator,
         payload: postValidators
         }
         },
         handler: function (request, reply) {
         if (request.pre.post) {
         request.pre.post.$query()
         .updateAndFetch({
         text: request.payload.text,
         seq: request.payload.seq,
         readingDayId: request.payload.readingDayId
         })
         .then(post => reply(post))
         .catch(err => reply(Boom.badImplementation(err)));
         } else {
         reply(Boom.notFound(`No post with ID ${request.params.id}`));
         }
         }
         },

         {
         method: 'DELETE',
         path: '/posts/{id}',
         config: {
         description: 'Delete a post',
         auth: 'jwt',
         pre: [
         {assign: 'post', method: 'getPost(params.id)'}
         ],
         validate: {
         params: idValidator
         }
         },
         handler: function (request, reply) {
         if (request.pre.post) {
         Post.query()
         .deleteById(request.params.id)
         .then(result => reply(result))
         .catch(err => reply(Boom.badImplementation(err)));
         } else {
         reply(Boom.notFound(`No post with ID ${request.params.id}`));
         }
         }
         }
         */

    ]);

    next();
};

exports.register.attributes = {name: 'post', version: '0.0.1'};
