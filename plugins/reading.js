'use strict';

const Boom = require('boom');

const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/readingday/{date?}',
        handler: function (request, reply) {
            let query_date = request.params.date || new Date();
            ReadingDay
                .query()
                .where('date', query_date)
                .first()
                .eager('[readings.[practices, collections.resources.[type, tags]]]')
                .then(reading_day => {
                    if (!reading_day) {
                        return reply(Boom.badRequest('Invalid date'));
                    } else {
                        let promises = [];
                        reading_day.readings.map(reading => {
                            server.log('info', reading);
                            let p = new Promise((resolve, reject) => {
                                server.methods.bg_passage('NKJV', reading.osis_ref, (err, result) => {
                                    if (err) {
                                        return reply(Boom.notFound(`Bible Gateway ${err}`));
                                    }
                                    reading.text = result.data[0].passages[0].content;
                                    return resolve(result);
                                })
                            });
                            promises.push(p);
                        });
                        Promise.all(promises).then(res => reply(reading_day.asJson()));
                    }
                })
                .catch(err => Boom.badImplementation(err));
        }
    });

    server.route({
        method: 'GET',
        path: '/readings/{id}',
        handler: function (request, reply) {
            Reading
                .query()
                .where('id', request.params.id)
                .first()
                .then(reading => {
                    if (reading) {
                        return reply(reading);
                    } else {
                        return reply(Boom.notFound(`Reading ${request.params.id}`));
                    }
                })
                .catch(err => Boom.badImplementation(err));
        }
    });

    next();
};

exports.register.attributes = {name: 'reading', version: '0.0.1'};
