'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const Question = require('../models/Question');

exports.register = function (server, options, next) {

    const idValidator = {
        id: Joi.number().integer().min(1).required().description('Question ID'),
    };

    const questionValidators = {
        readingDayId: Joi.number().integer().min(1).required().description('Reading day ID'),
        seq: Joi.number().integer().min(0).required().description('Sequence number'),
        text: Joi.string().required().description('Question text')
    };

    server.method('getQuestion', function (questionId, next) {
        Question.query()
            .findById(questionId)
            .then(question => next(null, question))
            .catch(err => next(err, null));
    });

    server.route([

        {
            method: 'POST',
            path: '/questions',
            config: {
                description: 'New daily question',
                auth: {
                    strategy: 'jwt',
                    access: { scope: 'admin' }
                },
                validate: {
                    payload: questionValidators
                }
            },
            handler: function (request, reply) {
                Question.query()
                    .insert({
                        text: request.payload.text,
                        seq: request.payload.seq,
                        readingDayId: request.payload.readingDayId
                    })
                    .returning('*')
                    .then(question => reply(question))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/daily/{date}/questions',
            config: {
                description: "Get questions for given date (or 'today')",
                validate: {
                    params: {
                        date: Joi.alternatives().try('today', Joi.date().iso())
                    }
                },
                pre: ['normalizeDate(params.date)']
            },
            handler: function (request, reply) {
                Question.query()
                    .select('question.id', 'question.seq', 'question.text')
                    .innerJoinRelation('readingDay')
                    .where('readingDay.date', request.pre.normalizeDate)
                    .orderBy('question.seq')
                    .then(questions => reply(questions))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/questions/{id}',
            config: {
                description: 'Fetch a question',
                auth: {
                    strategy: 'jwt',
                    access: { scope: 'admin' }
                },
                pre: [
                    {assign: 'question', method: 'getQuestion(params.id)'}
                ],
                validate: {
                    params: idValidator
                }
            },
            handler: function (request, reply) {
                if (request.pre.question) {
                    reply(request.pre.question);
                } else {
                    reply(Boom.notFound(`No question with ID ${request.params.id}`));
                }
            }
        },

        {
            method: 'PATCH',
            path: '/questions/{id}',
            config: {
                description: 'Update a question',
                auth: {
                    strategy: 'jwt',
                    access: { scope: 'admin' }
                },
                pre: [
                    {assign: 'question', method: 'getQuestion(params.id)'}
                ],
                validate: {
                    params: idValidator,
                    payload: questionValidators
                }
            },
            handler: function (request, reply) {
                if (request.pre.question) {
                    request.pre.question.$query()
                        .updateAndFetch({
                            text: request.payload.text,
                            seq: request.payload.seq,
                            readingDayId: request.payload.readingDayId
                        })
                        .then(question => reply(question))
                        .catch(err => reply(Boom.badImplementation(err)));
                } else {
                    reply(Boom.notFound(`No question with ID ${request.params.id}`));
                }
            }
        },

        {
            method: 'DELETE',
            path: '/questions/{id}',
            config: {
                description: 'Delete a question',
                auth: {
                    strategy: 'jwt',
                    access: { scope: 'admin' }
                },
                pre: [
                    {assign: 'question', method: 'getQuestion(params.id)'}
                ],
                validate: {
                    params: idValidator
                }
            },
            handler: function (request, reply) {
                if (request.pre.question) {
                    Question.query()
                        .deleteById(request.params.id)
                        .then(result => reply(result))
                        .catch(err => reply(Boom.badImplementation(err)));
                } else {
                    reply(Boom.notFound(`No question with ID ${request.params.id}`));
                }
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'question', version: '0.0.1'};
