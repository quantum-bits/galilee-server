'use strict';

const Boom = require('boom');

const CalendarDate = require('../models/CalendarDate');

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/today',
        handler: function (request, reply) {
            CalendarDate
                .query()
                .first()
                .eager('pericopes.[reading.type, passages, practices, collections.resources.[type, tags]]')
                .then(calendar_date => {
                    let promises = [];
                    calendar_date.pericopes.map(pericope => {
                        pericope.passages.map(passage => {
                            let p = new Promise((resolve, reject) => {
                                server.methods.bg_passage('NKJV', passage.osis_ref, (err, result) => {
                                    if (err) {
                                        return reply(Boom.notFound(`Bible Gateway ${err}`));
                                    }
                                    passage.text = result.data[0].passages[0].content;
                                    return resolve(result);
                                })
                            });
                            promises.push(p);
                        })
                    })
                    Promise.all(promises).then(res => reply(lection.asJson()));
                })
                .catch(err => Boom.badImplementation(err));
        }
    });

    next();

};

exports.register.attributes = {name: 'calendar', version: '0.0.1'};
