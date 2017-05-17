'use strict';


import {initTest, expect, server, db} from './support';
const lab = exports.lab = initTest();
const Practice = require('../models/Practice');

lab.experiment('Test engagement endpoints', () => {

    let testPractices = null;

    lab.beforeEach(done => {
        return db.knex.raw('TRUNCATE public.practice CASCADE')
            .then(result => {
                return Promise.all([
                    Practice
                        .query()
                        .insertGraph({
                            title: "Lectio Divina",
                            summary: "Description of Lectio Divina",
                        }),

                    Practice
                        .query()
                        .insertGraph({
                            title: "Praying Scripture",
                            summary: "Description of Praying Scripture",
                        })

                ]).catch(err => {
                    console.log('ERROR', err);
                })
            })
            .then(practices => {
                testPractices = practices;
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
                expect(response[0].title).to.equal("Lectio Divina");
                done();
            });
    });

    lab.test('Fetch an existing practice', done => {
        const practiceId = testPractices[0].id;

        server.inject(
            {
                method: 'GET',
                url: `/practices/${practiceId}`
            }, res => {
                const response = JSON.parse(res.payload);
                console.log("RES", JSON.stringify(response, null, 4));
                expect(res.statusCode).to.equal(200);
                expect(response.id).to.equal(practiceId);
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
