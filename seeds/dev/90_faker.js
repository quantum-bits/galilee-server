'use strict';

const debug = require('debug')('seed');
const faker = require('faker');
const _ = require('lodash');

const User = require('../../models/User');
const Version = require('../../models/Version');

function seedVersions() {
    let all_versions = [];
    const version_data = [
        {code: 'ESV', title: 'English Standard Version'},
        {code: 'KJV', title: 'King James Version'},
        {code: 'NASB', title: 'New American Standard Version'},
        {code: 'NIV', title: 'New International Version'},
        {code: 'NKJV', title: 'New King James Version'},
        {code: 'RSV', title: 'Revised Standard Version'}
    ];

    return Promise.all(version_data.map(datum =>
        Version.query().where('code', datum.code).first().then(result => {
            debug("Result %o", result);
            if (result) {
                // Already have this one in the database. Returning 'v' is
                // equivalent to returning a resolved promise.
                debug("Already have %o", result);
                return result;
            } else {
                // Don't have this one. Spin up an insertion and return
                // a promise.
                debug("Must insert %s", datum.code);
                return Version.query().insertAndFetch(datum);
            }
        }).then(version => {
            // There are two cases for the previous promise:
            //  1. The promise was resolved by an existing version in the DB,
            //     in which case this 'then' resolved trivially.
            //  2. The promise from the insert was resolved by this then.
            // In either case, we now have a version object form the database
            // and can insert it into the list of all versions.
            //
            // Even if the insert failed, we should be okay, because the
            // catch clause will pick it up.
            debug("Adding %o", version)
            all_versions.push(version);
        }).catch(err => {
            console.error("ERR", err);
        })
    ));
}

function seedUsers() {
    return Promise.all(_.times(10, n => {
        let fakeUser = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        };
        debug("User %o", fakeUser);
        return User.query().insert(fakeUser);
    }));
}

exports.seed = function (knex, Promise) {
    return Promise.join(
        seedVersions(),
        seedUsers());
}
