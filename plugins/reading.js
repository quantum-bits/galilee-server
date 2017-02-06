'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const moment = require('moment');
const _ = require('lodash');

const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');
const DailyQuestion = require('../models/DailyQuestion');

function todaysDate() {
    return moment().format('YYYY-MM-DD');
}

exports.register = function (server, options, next) {

    // Normalize the date parameter.
    server.method('normalizeDate', (request, reply) => {
        let queryDate = request.params.date;
        if (queryDate === 'today') {
            queryDate = todaysDate();
        }
        reply(queryDate);
    });

    // Get statistics on all the user's journal entries.
    server.method('getReadingStats', function (next) {
        Reading.query()
            .join('readingDay', 'readingDayId', 'readingDay.id')
            .select('readingDay.date')
            .map(result => moment(result.date).format('YYYY-MM-DD'))
            .then(dates => next(null, _.countBy(dates)))
            .catch(err => next(err, null));
    });

    server.route([
        {
            method: 'GET',
            path: '/daily/{date}',
            config: {
                description: "Get readings for given date (or 'today')",
                pre: ['normalizeDate']
            },
            handler: function (request, reply) {
                ReadingDay.query()
                    .where('date', request.pre.normalizeDate)
                    .first()
                    .eager('[readings.applications.[practice,steps.resources],questions]')
                    .then(readingDay => {
                        if (!readingDay) {
                            reply(Boom.notFound(`No reading data for '${request.pre.normalizeDate}'`));
                        } else {
                            // Massage questions into simple list of strings.
                            readingDay.questions = readingDay.questions.map(obj => obj.question)

                            // Fetch scripture text from Bible Gateway.
                            let promises = [];
                            readingDay.readings.map(reading => {
                                let p = new Promise((resolve, reject) => {
                                    server.methods.bgPassage('NKJV', reading.osisRef, (err, result) => {
                                        if (err) {
                                            reading.text = `Bible Gateway error '${err}'`;
                                        } else {
                                            reading.text = result.data[0].passages[0].content;
                                        }
                                        return resolve(result);
                                    })
                                });
                                promises.push(p);
                            });

                            // Wait for Bible Gateway to complete and respond to client.
                            Promise.all(promises).then(res => {
                                reply(readingDay);
                            });
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/daily/{date}/questions',
            config: {
                description: "Get questions for given date (or 'today')",
                pre: ['normalizeDate']
            },
            handler: function (request, reply) {
                DailyQuestion.query()
                    .select('dailyQuestion.id', 'dailyQuestion.seq', 'dailyQuestion.question')
                    .innerJoinRelation('readingDay')
                    .where('readingDay.date', request.pre.normalizeDate)
                    .orderBy('dailyQuestion.seq')
                    .then(questions => reply(questions))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/readings/meta',
            config: {
                description: 'Readings metadata',
                auth: 'jwt',
                pre: [
                    {assign: 'readingStats', method: 'getReadingStats()'}
                ]
            },
            handler: function (request, reply) {
                reply(request.pre.readingStats);
            }
        },


        {
            method: 'GET',
            path: '/readings/{id}',
            handler: function (request, reply) {
                Reading.query()
                    .where('id', request.params.id)
                    .first()
                    .then(reading => {
                        if (reading) {
                            reply(reading);
                        } else {
                            reply(Boom.notFound(`Reading ${request.params.id} not found`));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'POST',
            path: '/questions',
            config: {
                description: 'New daily question',
                auth: 'jwt',
                validate: {
                    payload: {
                        readingDayId: Joi.number().integer().min(1).required().description('Reading day ID'),
                        seq: Joi.number().integer().min(0).required().description('Sequence number'),
                        question: Joi.string().required().description('Question text')
                    }
                }
            },
            handler: function (request, reply) {
                DailyQuestion.query()
                    .insert({
                        question: request.payload.question,
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
            path: '/questions/{id}',
            config: {
                description: 'Fetch a question',
                auth: 'jwt',
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required().description('Question ID'),
                    }
                }
            },
            handler: function (request, reply) {
                DailyQuestion.query()
                    .findById(request.params.id)
                    .then(question => {
                        if (question) {
                            reply(question);
                        } else {
                            reply(Boom.notFound(`No question with ID ${request.params.id}`));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)))
            }
        },

    ]);

    next();
};

exports.register.attributes = {name: 'reading', version: '0.0.1'};
