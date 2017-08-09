'use strict';

const User = require('../../models/User');
const faker = require('faker');

exports.seed = function (knex, Promise) {
    return User.query().insertGraph(
        [
            {
                email: 'teacher@example.com',
                password: 'teacher-password',
                firstName: 'Penny',
                lastName: 'Lane',
                version: {
                    code: 'NKJV',
                    title: 'New King James Version'
                },
                groups: [
                    {
                        name: 'Second North Euler',
                        organization: {
                            "#id": "TU",
                            name: 'Taylor University'
                        }
                    },
                    {
                        name: 'SNAS',
                        organization: {
                            "#ref": "TU"
                        }
                    }
                ]
            },
            {
                email: 'student@example.com',
                password: 'student-password',
                firstName: 'Ferris',
                lastName: 'Wheeler',
                version: {
                    '#id': 'version-esv',
                    code: 'ESV',
                    title: 'English Standard Version'
                },
                groups: [
                    {
                        name: 'The Brotherhood',
                        organization: {
                            "#ref": "TU",
                        }
                    }
                ],
                tags: [
                    {'#id': 'tag-discipleship', label: 'discipleship'},
                    {'#id': 'tag-spirituality', label: 'spirituality'}
                ],
                journalEntries: [
                    {
                        title: faker.lorem.sentence(),
                        entry: faker.lorem.paragraphs(),
                        tags: [{'#ref': 'tag-discipleship'}]
                    },
                    {
                        title: faker.lorem.sentence(),
                        entry: faker.lorem.paragraphs(),
                        tags: [
                            {'#ref': 'tag-discipleship'},
                            {'#ref': 'tag-spirituality'}
                        ]
                    }
                ]
            },
            {
                email: 'admin@example.com',
                password: 'admin-password',
                firstName: 'Royal',
                lastName: 'Payne',
                version: {
                    '#ref': 'version-esv'
                },
                permissions: [
                    {
                        id: 'EDIT_RES',
                        title: 'Edit Resources'
                    },
                    {
                        id: 'EDIT_PRAC',
                        title: 'Edit Practices',
                    },
                    {
                        id: 'ADMIN',
                        title: 'Administrator'
                    }
                ]
            }

        ]).catch(err => console.log('There was a problem', err));
};
