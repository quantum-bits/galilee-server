'use strict';

const Boom = require('boom');

const ReadingDay = require('../models/ReadingDay');

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/readings/{date?}',
        handler: function (request, reply) {
            let query_date = request.params.date || new Date();
            ReadingDay
                .query()
                .where('date', query_date)
                .first()
                .eager('[readings.[practices, collections.resources.[type, tags]]]')
                .then(reading_day => {
                    server.log('info', "Reading day", reading_day);
                    if (reading_day) {
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
                    } else {
                        reply(Boom.badRequest(`No readings for ${request.params.date}`));
                    }
                })
                .catch(err => Boom.badImplementation(err));
        }
    });

    next();
};

exports.register.attributes = {name: 'reading', version: '0.0.1'};
