'use strict';

const User = require('../../models/User');

exports.seed = function (knex, Promise) {
    return Promise.all([
        knex('membership').del(),
        knex('user_permission').del(),

    ]).then(() => Promise.all([
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
            first_name: 'Penny',
            last_name: 'Lane',
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
            first_name: 'Ferris',
            last_name: 'Wheeler',
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
            ]
        },
        {
            email: 'admin@example.com',
            password: 'password',
            first_name: 'Royal',
            last_name: 'Payne',
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
