'use strict';

import {initTest, masterConfig, expect, server, db} from './support';
import {loadUserCollection} from './fixtures';

const lab = exports.lab = initTest();

const _ = require('lodash');
const debug = require('debug')('test');
const random = require('random-js')();
const jwt = require('jsonwebtoken');

const ReadingDay = require('../models/ReadingDay');
const Config = require('../models/Config');
const User = require('../models/User');

// Expect the database to contain `expected` users.
function expectCountUsers(expected) {
    return User.query()
        .count('*')
        .then(resultSet => expect(+resultSet[0].count).to.equal(expected));
}

// Verify that a JWT is valid against the secret key.
function verifyJwt(jwtIdToken) {
    return jwt.verify(jwtIdToken, masterConfig.get('jwt-key'));
}

// Reverse the letters in a string.
function reverseString(str) {
    return str.split('').reverse().join('');
}

lab.experiment('User endpoint', () => {

    let userCollection = null;

    lab.beforeEach(() => {
        return db.deleteAllData()
            .then(() => Config.query()
                .insertGraph([
                    {key: 'default-version', value: 'MSG'}
                ]))
            // TODO: There must be a smarter way to do this!
            .then(() => loadUserCollection(server))
            .then(collection => userCollection = collection);
    });

    lab.test('creates a new user', () => {
        return server
            .inject({
                method: 'POST',
                url: '/api/users',
                payload: {
                    email: 'new@example.com',
                    password: 'new-password',
                    firstName: 'Marsha',
                    lastName: 'Mellow',
                    preferredVersionId: userCollection.randomVersionId()
                }
            })
            .then(res => {
                expect(res.statusCode).to.equal(200);
            })
            .then(() => expectCountUsers(userCollection.numUsers() + 1));
    });

    lab.test('rejects a new user with a missing field (chosen at at random)', () => {
        const allFields = {
            email: 'new@example.com',
            password: 'new-password',
            firstName: 'Marsha',
            lastName: 'Mellow',
            preferredVersionId: userCollection.randomVersionId()
        };
        return server
            .inject({
                method: 'POST',
                url: '/api/users',
                payload: _.omit(allFields, random.pick(_.keys(allFields)))
            })
            .then(res => {
                expect(res.statusCode).to.equal(400);
            })
            .then(() => expectCountUsers(userCollection.numUsers()));
    });

    lab.test('rejects a new user with a duplicate email address', () => {
        const studentUser = userCollection.findUser('student@example.com');

        return server
            .inject({
                method: 'POST',
                url: '/api/users',
                payload: {
                    email: studentUser.rawData.email,
                    password: 'new-user-password',
                    firstName: 'Marsha',
                    lastName: 'Mellow',
                    preferredVersionId: userCollection.randomVersionId()
                }
            })
            .then(res => {
                expect(res.statusCode).to.equal(409);
            })
            .then(() => expectCountUsers(userCollection.numUsers()));
    });

    lab.test('rejects login with a bogus account', () =>
        server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: 'zippyfritz@example.com',
                password: 'bogus-password'
            }
        }).then(res => {
            expect(res.statusCode).to.equal(401);
        })
    );

    lab.test('rejects login with a valid account but bogus password', () => {
        const studentUser = userCollection.findUser('student@example.com');

        return server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: studentUser.rawData.email,
                password: 'the-wrong-password',
            }
        }).then(res => {
            expect(res.statusCode).to.equal(401);
        });
    });

    lab.test('allows a valid user to log in', () => {
        const studentUser = userCollection.findUser('student@example.com');

        return server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: studentUser.rawData.email,
                password: studentUser.rawData.password
            }
        }).then(res => {
            const response = JSON.parse(res.payload);
            expect(res.statusCode).to.equal(200);
            expect(() => verifyJwt(response.jwtIdToken)).not.to.throw();
            expect(response.user.permissions).part.not.to.contain({id: 'ADMIN'});
        });
    });

    lab.test('allows a valid admin user to log in', () => {
        const adminUser = userCollection.findUser('admin@example.com');

        return server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: adminUser.rawData.email,
                password: adminUser.rawData.password
            }
        }).then(res => {
            const response = JSON.parse(res.payload);
            expect(res.statusCode).to.equal(200);
            expect(() => verifyJwt(response.jwtIdToken)).not.to.throw();
            expect(response.user.permissions).part.to.contain({id: 'ADMIN'});
        });
    });

    lab.test('retrieves permission types', () =>
        server.inject({
            method: 'GET',
            url: '/api/users/permissions',
            headers: userCollection.authHeaders('student@example.com')
        }).then(res => {
            expect(res.statusCode).to.equal(200);
            const response = JSON.parse(res.payload);
            expect(response).only.to.contain({id: 'ADMIN', title: 'Administrator'});
        })
    );

    lab.test('retrieves all users', () =>
        server.inject({
            method: 'GET',
            url: '/api/users',
            headers: userCollection.authHeaders('admin@example.com')
        }).then(res => {
            expect(res.statusCode).to.equal(200);
            const response = JSON.parse(res.payload);
            expect(response).to.have.length(3);
        })
    );

    lab.test('denies retrieval of all users to non-admin', () =>
        server.inject({
            method: 'GET',
            url: '/api/users',
            headers: userCollection.authHeaders('student@example.com')
        }).then(res => {
            expect(res.statusCode).to.equal(401);
        })
    );

    lab.test('rejects an attempt to update a user without authenticating', () =>
        server.inject({
            method: 'PATCH',
            url: '/api/users/55555'
        }).then(res => {
            expect(res.statusCode).to.equal(401);
        })
    );

    lab.test('rejects omission of user ID', () =>
        server.inject({
            method: 'PATCH',
            url: '/api/users',
            headers: userCollection.authHeaders('student@example.com')
        }).then(res => {
            expect(res.statusCode).to.equal(404);
        })
    );

    lab.test('rejects empty payload', () => {
        const studentUser = userCollection.findUser('student@example.com');

        return server.inject({
            method: 'PATCH',
            url: `/api/users/${studentUser.dbData.id}`,
            headers: userCollection.authHeaders('student@example.com'),
            payload: {}
        }).then(res => {
            expect(res.statusCode).to.equal(400);
        });
    });

    lab.test('updates one attribute (normal user)', () => {
        const studentUser = userCollection.findUser('student@example.com');
        const reversedName = reverseString(studentUser.dbData.firstName);

        return server.inject({
            method: 'PATCH',
            url: `/api/users/${studentUser.dbData.id}`,
            headers: userCollection.authHeaders('student@example.com'),
            payload: {
                firstName: reversedName
            }
        }).then(res => {
            expect(res.statusCode).to.equal(200);
            const response = JSON.parse(res.payload);
            expect(response.firstName).to.equal(reversedName);
        });
    });

    lab.test('updates multiple attributes (normal user)', () => {
        const studentUser = userCollection.findUser('student@example.com');
        const reversedFirst = reverseString(studentUser.dbData.firstName);
        const reversedLast = reverseString(studentUser.dbData.lastName);

        return server.inject({
            method: 'PATCH',
            url: `/api/users/${studentUser.dbData.id}`,
            headers: userCollection.authHeaders('student@example.com'),
            payload: {
                firstName: reversedFirst,
                lastName: reversedLast
            }
        }).then(res => {
            expect(res.statusCode).to.equal(200);
            const response = JSON.parse(res.payload);
            expect(response.firstName).to.equal(reversedFirst);
            expect(response.lastName).to.equal(reversedLast);
        });
    });

    lab.test('rejects attempt to update different user (not as admin)', () => {
        const studentUser = userCollection.findUser('student@example.com');

        return server.inject({
            method: 'PATCH',
            url: `/api/users/${studentUser.dbData.id}`,
            headers: userCollection.authHeaders('staff@example.com'),
            payload: {
                firstName: 'Wallace'
            }
        }).then(res => {
            expect(res.statusCode).to.equal(401);
        });
    });

    lab.test('updates attribute of another user as admin', () => {
        const studentUser = userCollection.findUser('student@example.com');
        const reversedFirst = reverseString(studentUser.dbData.firstName);

        return server.inject({
            method: 'PATCH',
            url: `/api/users/${studentUser.dbData.id}`,
            headers: userCollection.authHeaders('admin@example.com'),
            payload: {
                firstName: reversedFirst
            }
        }).then(res => {
            expect(res.statusCode).to.equal(200);
            const response = JSON.parse(res.payload);
            expect(response.firstName).to.equal(reversedFirst);
        });
    });

    lab.test('updates user with non-duplicate email address', () => {
        const studentUser = userCollection.findUser('student@example.com');
        const newEmail = 'new.user@example.com';

        return server.inject({
            method: 'PATCH',
            url: `/api/users/${studentUser.dbData.id}`,
            headers: userCollection.authHeaders('student@example.com'),
            payload: {
                email: newEmail
            }
        }).then(res => {
            expect(res.statusCode).to.equal(200);
            const response = JSON.parse(res.payload);
            expect(response.email).to.equal(newEmail);
        });
    });

    lab.test('rejects attempt to set duplicate email address', () => {
        const studentUser = userCollection.findUser('student@example.com');
        const staffUser = userCollection.findUser('staff@example.com');

        return server.inject({
            method: 'PATCH',
            url: `/api/users/${studentUser.dbData.id}`,
            headers: userCollection.authHeaders('student@example.com'),
            payload: {
                email: staffUser.dbData.email
            }
        }).then(res => {
            expect(res.statusCode).to.equal(409);
        });
    });

});
