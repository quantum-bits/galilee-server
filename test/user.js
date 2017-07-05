'use strict';

import {initTest, expect, server, db} from './support';
const lab = exports.lab = initTest();

const ReadingDay = require('../models/ReadingDay');
const Config = require('../models/Config');
const User = require('../models/User');

lab.experiment('User endpoints', () => {

    let studentJwt = null;
    let adminJwt = null;

    function authenticateAdmin() {
        return server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: 'admin@example.com',
                password: 'admin-password'
            }
        }).then(res => {
            adminJwt = JSON.parse(res.payload).jwtIdToken;
        });
    }

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
            .then(() => authenticateAdmin());
    });

    lab.test('allow a valid user to log in', done => {
        server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: 'student@example.com',
                password: 'student-password'
            }
        }, res => {
            const response = JSON.parse(res.payload);
            expect(res.statusCode).to.equal(200);
            expect(response.jwtIdToken).to.have.length(145);
            done();
        });
    });

});
