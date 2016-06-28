'use strict';

import {init_test, expect, server, db} from './support';
const lab = exports.lab = init_test();

const Practice = require('../models/Practice');

lab.experiment('Test engagement endpoints', () => {

    let test_practices = null;

    lab.beforeEach(done => {
        return db.knex.raw('TRUNCATE public.practice CASCADE')
            .then(result => {
                return Promise.all([
                    Practice
                        .query()
                        .insertWithRelated({
                            title: "Lectio Divina",
                            description: "Description of Lectio Divina",
                            details: [
                                {
                                    title: "Lectio Divina Tips",
                                    description: "Tips on Lectio Divina"
                                },
                                {
                                    title: "Lectio Divina in a small group",
                                    description: "Tips on Lectio Divina in a small group"
                                },
                                {
                                    title: "Lectio Divina resources",
                                    description: "Resources for Lectio Divina"
                                }
                            ]
                        }),

                    Practice
                        .query()
                        .insertWithRelated({
                            title: "Praying Scripture",
                            description: "Description of Praying Scripture",
                            details: [
                                {
                                    title: "Praying Scripture Tips",
                                    description: "Tips on Praying Scripture"
                                },
                                {
                                    title: "Praying Scripture in a small group",
                                    description: "Tips on Praying Scripture in a small group"
                                },
                                {
                                    title: "Praying Scripture resources",
                                    description: "Resources for Praying Scripture"
                                }
                            ]
                        })

                ]).catch(err => {
                    console.log('ERROR', err);
                })
            })
            .then(practices => {
                test_practices = practices;
            })
    });

    lab.test('Fetch all practices', done => {
        server.inject(
            {
                method: 'GET',
                url: '/practices'
            }, res => {
                const response = JSON.parse(res.payload);
                console.log("RES", JSON.stringify(response, null, 4));
                expect(res.statusCode).to.equal(200);
                expect(response).to.have.length(2);
                expect(response[0].details).to.have.length(3);
                done();
            });
    });

    lab.test('Fetch an existing practice', done => {
        const practice_id = test_practices[0].id;

        server.inject(
            {
                method: 'GET',
                url: `/practices/${practice_id}`
            }, res => {
                const response = JSON.parse(res.payload);
                console.log("RES", JSON.stringify(response, null, 4));
                expect(res.statusCode).to.equal(200);
                expect(response.id).to.equal(practice_id);
                expect(response.details).to.have.length(3);
                done();
            });
    });

    lab.test("Try to fetch a practice that doesn't exist", done => {
        server.inject(
            {
                method: 'GET',
                url: '/practices/0'
            }, res => {
                const response = JSON.parse(res.payload);
                console.log("RES", JSON.stringify(response, null, 4));
                expect(res.statusCode).to.equal(404);
                done();
            });
    });

});
