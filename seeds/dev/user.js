'use strict';

const User = require('../../models/User');

exports.seed = function (knex, Promise) {
    return knex('version').del()

        .then(Promise.all([
            knex('user_permission').del(),
            knex('permission').del(),
            knex('user').del()
        ]))

        .then(() => User.query().insertWithRelated(
            [
                {
                    email: 'alpha@example.com',
                    password: 'foo',
                    first_name: 'Alpha',
                    last_name: 'User',
                    version: {
                        code: 'KJV',
                        title: 'King James Version'
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
                    email: 'super@example.com',
                    password: 'foo',
                    first_name: 'Super',
                    last_name: 'User',
                    version: {
                        code: 'ESV',
                        title: 'English Standard Version'
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
            ])
        )

        .catch(err => console.log('There was a problem', err));
};
