'use strict';

const Boom = require('boom');

const Lection = require('../models/Lection');

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/lection',
        handler: function (request, reply) {
            Lection
                .query()
                .first()
                .eager('[type, readings.[type, pericopes.passages]]')
                .then(lection => {
                    let promises = [];
                    lection.readings.map(reading => {
                        reading.pericopes.map(pericope => {
                            pericope.passages.map(passage => {
                                server.log('info', passage);
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
                    })
                    Promise.all(promises).then(res => reply(lection));
                })
                .catch(err => Boom.badImplementation(err));
        }
    });

    next();

};

exports.register.attributes = {name: 'lection', version: '0.0.1'};
