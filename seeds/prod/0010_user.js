'use strict';

const debug = require('debug')('seed');
const faker = require('faker');

const User = require('../../models/User');

exports.seed = function (knex, Promise) {
    debug("RUNNING USER");
    return User.query().insertGraph(
        [
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
                        name: 'Cool Wing',
                        organization: {
                            "#ref": "TU",
                        }
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

        ]).catch(err => console.log('There was a problem', err));
};
