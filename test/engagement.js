'use strict';

import {initTest, expect, server, db} from './support';
const lab = exports.lab = initTest();

const ReadingDay = require('../models/ReadingDay');
const Config = require('../models/Config');
const User = require('../models/User');

lab.experiment('Test engagement endpoints', () => {

    let testPractices = null;

    lab.beforeEach(done => {
        return db.deleteAllData()
            .then(result => {
                return Promise.all([
                    Config.query()
                        .insertGraph([
                            {key: 'upload-root', value: '../resources'},
                            {key: 'bg-access-token', value: null},
                            {key: 'default-version', value: 'MSG'}
                        ]),

                    User.query()
                        .insertGraph([
                            {
                                email: 'student@example.com',
                                password: 'student-password',
                                firstName: 'Jane',
                                lastName: 'Student',
                                joinedOn: '2017-01-04',
                                enabled: true,
                                version: {
                                    '#id': 'version-ver',
                                    code: 'VER',
                                    title: 'Version of the Bible'
                                }
                            },
                            {
                                email: 'admin@example.com',
                                password: 'admin-password',
                                firstName: 'June',
                                lastName: 'Admin',
                                joinedOn: '2017-02-04',
                                enabled: true,
                                version: {
                                    '#ref': 'version-ver'
                                },
                                permissions: [
                                    {
                                        id: 'ADMIN',
                                        title: 'Administrator'
                                    }
                                ]
                            }
                        ]),

                    ReadingDay.query()
                        .insertGraph({
                            date: '2017-07-04',
                            name: 'Independence Day',
                            readings: [
                                {
                                    seq: 1,
                                    stdRef: 'Jude 1:20',
                                    osisRef: 'Jude.1.20',
                                    directions: [
                                        {
                                            seq: 1,
                                            practice: {
                                                title: "Lectio Divina",
                                                summary: "Summary of Lectio Divina",
                                                infoUrl: "http://biblegateway.com",
                                            },
                                            steps: [
                                                {
                                                    seq: 1,
                                                    description: "Do step 1"
                                                },
                                                {
                                                    seq: 2,
                                                    description: "Do step 2"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                        })

                ]).catch(err => {
                    console.log('ERROR', err);
                })
            })
            .then(practices => {
                testPractices = practices;
            })
    });

    lab.test('Log in', done => {
        server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: 'student@example.com',
                password: 'student-password'
            }
        }, res => {
            const response = JSON.parse(res.payload);
            console.log("REQUEST", JSON.stringify(res.request.auth, null, 4));
            console.log("RESPONSE", JSON.stringify(response, null, 4));
            expect(res.statusCode).to.equal(200);
            expect(response.jwtIdToken).to.have.length(145);
            done();
        });
    });

    lab.test('Fetch all practices', done => {
        server.inject(
            {
                method: 'GET',
                url: '/api/practices'
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
        const practiceId = testPractices[0].id;

        server.inject(
            {
                method: 'GET',
                url: `/api/practices/${practiceId}`
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
                url: '/api/practices/0'
            }, res => {
                const response = JSON.parse(res.payload);
                console.log("RES", JSON.stringify(response, null, 4));
                expect(res.statusCode).to.equal(404);
                done();
            });
    });

});
