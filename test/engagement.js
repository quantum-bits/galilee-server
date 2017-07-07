'use strict';

import {initTest, expect, server, authenticateUser, db} from './support';
const lab = exports.lab = initTest();

const ReadingDay = require('../models/ReadingDay');
const Config = require('../models/Config');
const User = require('../models/User');

lab.experiment('Practice endpoints', () => {

    let studentJwt = null;
    let adminJwt = null;

    lab.beforeEach(() => {
        return db.deleteAllData()
            .then(() => Config.query()
                .insertGraph([
                    {key: 'upload-root', value: '../resources'},
                    {key: 'bg-access-token', value: null},
                    {key: 'default-version', value: 'MSG'}
                ]))
            .then(() => Promise.all([
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
                                            id: 10,
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
                                            },
                                            {
                                                seq: 3,
                                                description: "Do step 3"
                                            }
                                        ]
                                    },
                                    {
                                        seq: 2,
                                        practice: {
                                            id: 11,
                                            title: "Storying Scripture",
                                            summary: "Summary of Storying Scripture",
                                            infoUrl: "http://biblegateway.com/storying",
                                        },
                                        steps: [
                                            {
                                                seq: 1,
                                                description: "Do step 1"
                                            }
                                        ]
                                    }

                                ]
                            }
                        ],
                    })
            ]))
            .then(() => Promise.all([
                authenticateUser('admin@example.com', 'admin-password')
                    .then(jwt => adminJwt = jwt),
                authenticateUser('student@example.com', 'student-password')
                    .then(jwt => studentJwt = jwt)
            ]));
    });

    lab.test('fetch all practices', done => {
        server.inject(
            {
                method: 'GET',
                url: '/api/practices',
                headers: {
                    'Authorization': `Bearer ${adminJwt}`
                }
            }, res => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(200);
                expect(response).to.have.length(2);
                done();
            });
    });

    lab.test('fetch a single existing practice', done => {
        server.inject(
            {
                method: 'GET',
                url: '/api/practices/10',
                headers: {
                    'Authorization': `Bearer ${adminJwt}`
                }
            }, res => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(200);
                expect(response.id).to.equal(10);
                done();
            });
    });

    lab.test("catches attempt to fetch a non-existent practice", done => {
        server.inject(
            {
                method: 'GET',
                url: '/api/practices/1',
                headers: {
                    'Authorization': `Bearer ${adminJwt}`
                }
            }, res => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(404);
                done();
            });
    });

});
