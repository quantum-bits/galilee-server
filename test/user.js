'use strict';

import {initTest, expect, server, authenticateUser, db} from './support';
import {loadUserCollection} from './fixtures';
const lab = exports.lab = initTest();

const _ = require('lodash');
const debug = require('debug')('test');
const random = require('random-js')();

const ReadingDay = require('../models/ReadingDay');
const Config = require('../models/Config');
const User = require('../models/User');

// Expect the database to contain `expected` users.
function expectCountUsers(expected) {
    return User.query()
        .count('*')
        .then(resultSet => expect(+resultSet[0].count).to.equal(expected));
}

lab.experiment('User endpoints', () => {

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

    lab.test('create a new user', () => {
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
            .then(() => expectCountUsers(3));
    });

    lab.test('reject a new user with a missing field (chosen at at random)', () => {
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
            .then(() => expectCountUsers(2));
    });

    lab.test('reject a new user with a duplicate email address', () => {
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
            .then(() => expectCountUsers(2));
    });

    lab.test('reject log in with a bogus account', done => {
        server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: 'zippyfritz@example.com',
                password: 'bogus-password'
            }
        }, res => {
            expect(res.statusCode).to.equal(401);
            done();
        });
    });

    lab.test('reject log in with a valid account but bogus password', done => {
        const studentUser = userCollection.findUser('student@example.com');

        server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: studentUser.rawData.email,
                password: 'the-wrong-password',
            }
        }, res => {
            expect(res.statusCode).to.equal(401);
            done();
        });
    });

    lab.test('allow a valid user to log in', done => {
        const studentUser = userCollection.findUser('student@example.com');

        server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: studentUser.rawData.email,
                password: studentUser.rawData.password
            }
        }, res => {
            const response = JSON.parse(res.payload);
            expect(res.statusCode).to.equal(200);
            expect(response.jwtIdToken).to.have.length(147);
            expect(response.user.permissions).part.not.to.contain({id: 'ADMIN'});
            done();
        });
    });

    lab.test('allow a valid admin user to log in', done => {
        const adminUser = userCollection.findUser('admin@example.com');

        server.inject({
            method: 'POST',
            url: '/api/authenticate',
            payload: {
                email: adminUser.rawData.email,
                password: adminUser.rawData.password
            }
        }, res => {
            const response = JSON.parse(res.payload);
            expect(res.statusCode).to.equal(200);
            expect(response.jwtIdToken).to.have.length(147);
            expect(response.user.permissions).part.to.contain({id: 'ADMIN'});
            done();
        });
    });

    lab.test('retrieve permission types', () =>
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

    lab.test('retrieve all users', () =>
        server.inject({
            method: 'GET',
            url: '/api/users',
            headers: userCollection.authHeaders('admin@example.com')
        }).then(res => {
            expect(res.statusCode).to.equal(200);
            const response = JSON.parse(res.payload);
            expect(response).to.have.length(2);
        })
    );

    lab.test('deny retrieval of all users to non-admin', () =>
        server.inject({
            method: 'GET',
            url: '/api/users',
            headers: userCollection.authHeaders('student@example.com')
        }).then(res => {
            expect(res.statusCode).to.equal(401);
        })
    );

});
