'use strict';

const User = require('../../models/User');
const loremIpsum = require('lorem-ipsum');


exports.seed = function (knex, Promise) {
    return Promise.all([
        knex('journal_entry_tag').del(),
        knex('user_tag').del()

    ]).then(() => Promise.all([
        knex('membership').del(),
        knex('user_permission').del(),
        knex('journal_entry').del()

    ])).then(() => Promise.all([
        knex('permission').del(),
        knex('group').del(),
        knex('user').del()

    ])).then(() => Promise.all([
        knex('version').del(),
        knex('organization').del()

    ])).then(() => User.query().insertWithRelated([
        {
            email: 'teacher@example.com',
            password: 'password',
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
            password: 'password',
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
                {'#id': 'tag-discipleship', text: 'discipleship'},
                {'#id': 'tag-spirituality', text: 'spirituality'}
            ],
            journal_entries: [
                {
                    title: 'My thoughts on the readings from today',
                    entry: loremIpsum(),
                    tags: [{'#ref': 'tag-discipleship'}]
                },
                {
                    title: 'My other reflections on some more readings from today',
                    entry: loremIpsum(),
                    tags: [
                        {'#ref': 'tag-discipleship'},
                        {'#ref': 'tag-spirituality'}
                    ]
                }
            ]
        },
        {
            email: 'admin@example.com',
            password: 'password',
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

    ])).catch(err => console.log('There was a problem', err));
};
