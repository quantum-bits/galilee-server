'use strict';

const Boom = require('boom');

const moment = require('moment');

const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');

function todaysDate() {
    return moment().format('YYYY-MM-DD');
}

exports.register = function (server, options, next) {

    // Normalize the date parameter.
    server.method('normalizeDate', (request, reply) => {
        let query_date = request.params.date;
        if (query_date === 'today') {
            query_date = todaysDate();
        }
        reply(query_date);
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
                    .then(reading_day => {
                        console.log("THEN");
                        if (!reading_day) {
                            reply(Boom.notFound(`No reading data for '${request.pre.normalizeDate}'`));
                        } else {
                            // Massage questions into simple list of strings.
                            reading_day.questions = reading_day.questions.map(obj => obj.question)

                            // Fetch scripture text from Bible Gateway.
                            let promises = [];
                            reading_day.readings.map(reading => {
                                server.log('info', JSON.stringify(reading, null, 2));
                                let p = new Promise((resolve, reject) => {
                                    server.methods.bg_passage('NKJV', reading.osis_ref, (err, result) => {
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
                                reply(reading_day);
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
                ReadingDay.query()
                    .where('date', request.pre.normalizeDate)
                    .first()
                    .eager('questions')
                    .then(reading_day => {
                        if (!reading_day) {
                            reply(Boom.notFound('No reading for this date'));
                        } else {
                            reply(reading_day.questions.map(obj => obj.question));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/readings/{id}',
            handler: function (request, reply) {
                Reading
                    .query()
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
            method: 'GET',
            path: '/toss-cookies/{maybe}',
            config: {
                description: 'Raise an error intentionally'
            },
            handler: function (request, reply) {
                let a_promise;
                if (request.params.maybe == 'OK') {
                    a_promise = Promise.resolve('This is good');
                } else {
                    a_promise = Promise.reject('This is bad');
                }

                a_promise
                    .then(() => {
                        console.log("WORKED");
                        reply({so: 'it worked'});
                    })
                    .catch(err => {
                        console.log("FAILED");
                        reply(Boom.badImplementation(err))
                    });
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'reading', version: '0.0.1'};
