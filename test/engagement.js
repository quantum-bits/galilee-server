'use strict';

import {initTest, expect, server, db} from './support';
import {loadUserCollection} from './fixtures';
const lab = exports.lab = initTest();

const ReadingDay = require('../models/ReadingDay');
const Config = require('../models/Config');
const User = require('../models/User');

lab.experiment('Practice endpoints', () => {

    let userCollection = null;

    lab.beforeEach(() => {
        return db.deleteAllData()
            .then(() => Config.query()
                .insertGraph([
                    {key: 'upload-root', value: '../resources'},
                    {key: 'bg-access-token', value: null},
                    {key: 'default-version', value: 'MSG'}
                ]))
            .then(() => loadUserCollection(server))
            .then(collection => userCollection = collection)
            .then(() => ReadingDay.query()
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
                }));
    });

    lab.test('fetch all practices', done => {
        server.inject(
            {
                method: 'GET',
                url: '/api/practices',
                headers: userCollection.authHeaders('admin@example.com')
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
                headers: userCollection.authHeaders('admin@example.com')
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
                headers: userCollection.authHeaders('admin@example.com')
            }, res => {
                const response = JSON.parse(res.payload);
                expect(res.statusCode).to.equal(404);
                done();
            });
    });

});
