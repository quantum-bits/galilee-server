'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const moment = require('moment');
const _ = require('lodash');

const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');
const Question = require('../models/Question');

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
                    .omit(['readingDayId', 'readingId', 'practiceId'])
                    .then(readingDay => {
                        if (!readingDay) {
                            reply(Boom.notFound(`No reading data for '${request.pre.normalizeDate}'`));
                        } else {
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
        }

    ]);

    next();
};

exports.register.attributes = {name: 'reading', version: '0.0.1'};
