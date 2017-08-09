'use strict';

const Promise = require("bluebird");
const debug = require('debug')('test');
const _ = require('lodash');

const User = require('../models/User');

const userDataGraph = [
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
        email: 'staff@example.com',
        password: 'staff-password',
        firstName: 'Sally',
        lastName: 'Staffer',
        joinedOn: '2016-09-15',
        enabled: true,
        version: {
            '#ref': 'version-ver'
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
];

// A user fixture contains two versions of the user's information:
// `rawData` refers to the user data graph from which the database is populated
// and `dbData` is the user data as fetched back from the database.
// The `dbData` version contains the user's encrypted password
// (where the `rawData` has the unencrypted one), the user's unique ID, etc.
class UserFixture {
    jwt = "INVALID";

    constructor(rawData, dbData) {
        this.rawData = rawData;
        this.dbData = dbData;
    }

    authenticate(server) {
        return server
            .inject({
                method: 'POST',
                url: '/api/authenticate',
                payload: {
                    email: this.rawData.email,
                    password: this.rawData.password
                }
            })
            .then(res => {
                this.jwt = JSON.parse(res.payload).jwtIdToken;
                return this;
            });
    }
}

class UserCollection {
    constructor(allUsers) {
        this.allUsers = allUsers;
    }

    findUser(email) {
        return _.find(this.allUsers, user => user.rawData.email === email);
    }

    authHeaders(email) {
        return {
            'Authorization': `Bearer ${this.findUser(email).jwt}`
        }
    }

    randomVersionId() {
        return _.sample(this.allUsers).dbData.preferredVersionId;
    }

    numUsers() {
        return this.allUsers.length;
    }
}

export function loadUserCollection(server) {
    let allUsers = [];

    return User.query()
        .insertGraph(userDataGraph)
        .then(() => Promise.map(userDataGraph, rawData => {
            return User.query()
                .where('email', rawData.email)
                .first()
                .then(dbData => new UserFixture(rawData, dbData))
                .then(userFixture => userFixture.authenticate(server))
                .then(userFixture => allUsers.push(userFixture))
        }))
        .then(() => new UserCollection(allUsers));
}
