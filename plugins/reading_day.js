'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Config = require('../models/Config');
const Passage = require('../models/Passage');
const Question = require('../models/Question');
const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');
const Version = require('../models/Version');

exports.register = function (server, options, next) {

    server.method('getReadingDayById', function (readingDayId, next) {
        ReadingDay.query()
            .findById(readingDayId)
            .then(readingDay => next(null, readingDay))
            .catch(err => next(err, null));
    });

    server.method('getReadingDayByDate', function (readingDayDate, next) {
        ReadingDay.query()
            .where('date', readingDayDate)
            .first()
            .then(readingDay => next(null, readingDay))
            .catch(err => next(err, null));
    });

    server.method('getVersion', function (code, next) {
        new Promise((resolve, reject) => {
            if (code) {
                resolve(code);
            } else {
                Config.query().findById('default-version').then(config => resolve(config.value));
            }
        }).then(code => {
            return Version.query().where('code', code).first();
        }).then(version => next(null, version))
            .catch(err => next(err, null));
    });

    function getReadingPassage(reading, version) {
        let content = null;
        reading.passages.forEach(passage => {
            if (passage.version.id === version.id) {
                content = passage.content;
            }
        });

        if (!content) {
            getPassage(version.code, reading.osisRef).then(passage => {
                Passage.query()
                    .insertAndFetch({
                        readingId: reading.id,
                        versionId: version.id,
                        content: passage.passages[0].content
                    })
            })
        }
    }

    server.route([
        {
            method: 'GET',
            path: '/daily/{date}/{version?}',
            config: {
                description: "Get readings for given date (or 'today')",
                pre: [
                    {assign: 'date', method: 'normalizeDate(params.date)'},
                    {assign: 'version', method: 'getVersion(params.version)'}
                ]
            },
            handler: function (request, reply) {
                // console.log("DATE", request.pre.date);
                // console.log("VERSION", request.pre.version);
                ReadingDay.query()
                    .where('date', request.pre.date)
                    .first()
                    .eager('[readings.applications.[practice,steps.resources],questions]')
                    .omit(['readingDayId', 'readingId', 'practiceId'])
                    .then(readingDay => {
                        if (!readingDay) {
                            reply(Boom.notFound(`No reading data for '${request.pre.date}'`));
                        } else {

                            readingDay.readings.map(reading => {
                                new Promise((resolve, reject) => {
                                    const passage = reading.getPassage(request.pre.version.id);
                                    if (passage) {
                                        reading.text = passage;
                                        resolve(true);
                                    } else {
                                        server.methods.getPassage(request.pre.version.code, reading.osisRef, (err, result) => {
                                            if (err) {
                                                reading.text = `Bible Gateway error '${err}'`;
                                            } else {
                                                reading.text = result.data[0].passages[0].content;
                                            }
                                            return resolve(true);
                                        });
                                    }

                                })
                            });


                            // Fetch scripture text from Bible Gateway.
                            let promises = [];
                            readingDay.readings.map(reading => {
                                let p = new Promise((resolve, reject) => {
                                    server.methods.getPassage(request.pre.version.code, reading.osisRef, (err, result) => {
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
            method: 'POST',
            path: '/readingdays',
            config: {
                description: 'Create reading day',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    payload: {
                        date: Joi.date().required().description('Date of reading day'),
                        name: Joi.string().description('Optional day name (e.g., Easter)')
                    }
                },
                pre: [
                    {assign: 'readingDay', method: 'getReadingDayByDate(payload.date)'}
                ]
            },
            handler: function (request, reply) {
                if (request.pre.readingDay) {
                    reply(Boom.conflict(`Already a reading day for ${request.payload.date}`));
                } else {
                    ReadingDay.query()
                        .insert({
                            date: request.payload.date,
                            name: request.payload.name || ''
                        })
                        .returning('*')
                        .then(readingDay => reply(readingDay))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'GET',
            path: '/readingdays',
            config: {
                description: 'Get all reading days',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
            },
            handler: function (request, reply) {
                ReadingDay.query()
                    .then(readingDays => reply(readingDays))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/readingdays/{id}',
            config: {
                description: 'Get a reading day',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    }
                },
                pre: [
                    {assign: 'readingDay', method: 'getReadingDayById(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.readingDay) {
                    reply(Boom.notFound(`No readingDay with ID ${request.params.id}`));
                } else {
                    reply(request.pre.readingDay);
                }
            }
        },

        {
            method: 'PATCH',
            path: '/readingdays/{id}',
            config: {
                description: 'Update reading day',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    },
                    payload: {
                        date: Joi.date().description('Date of reading day'),
                        name: Joi.string().description('Optional day name (e.g., Easter)')
                    }
                },
                pre: [
                    {assign: 'readingDay', method: 'getReadingDayById(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.readingDay) {
                    reply(Boom.notFound(`No reading day with ID ${request.params.id}`));
                } else {
                    request.pre.readingDay.$query()
                        .updateAndFetch(request.payload)
                        .then(readingDay => reply(readingDay))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'DELETE',
            path: '/readingdays/{id}',
            config: {
                description: 'Delete a reading day',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    }
                },
                pre: [
                    {assign: 'readingDay', method: 'getReadingDayById(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.readingDay) {
                    reply(Boom.notFound(`No readingDay with ID ${request.params.id}`));
                } else {
                    ReadingDay.query()
                        .deleteById(request.params.id)
                        .then(result => reply(result))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'readingday', version: '0.0.1'};
