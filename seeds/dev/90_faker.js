'use strict';

const Debug = require('debug');
const debug = Debug('seed:debug');
const log = Debug('seed:log');

const faker = require('faker');
const _ = require('lodash');

const User = require('../../models/User');
const Version = require('../../models/Version');

const versionData = [
    {code: 'ESV', title: 'English Standard Version'},
    {code: 'KJV', title: 'King James Version'},
    {code: 'NASB', title: 'New American Standard Version'},
    {code: 'NIV', title: 'New International Version'},
    {code: 'NKJV', title: 'New King James Version'},
    {code: 'RSV', title: 'Revised Standard Version'}
];
let versionObjects = [];

function seedVersions() {
    return Promise.all(versionData.map(datum =>
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
            versionObjects.push(version);
        }).catch(err => {
            console.error("ERR", err);
        })
    ));
}

function seedUsers() {
    return Promise.all(_.times(10, n =>
        User.query().insert({
            email: faker.internet.email(),
            password: faker.internet.password(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            joinedOn: faker.date.past(2),
            preferredVersionId: faker.random.arrayElement(versionObjects).id
        })
    ))
}

/**
 * Randomly return true a times out of n.
 * @param a
 * @param n
 * @returns {boolean}
 */
function chanceIn(a, n) {
    let val = faker.random.number({min: 1, max: n});
    return (val <= a);
}

function seedJournalEntries() {
    let today = new Date();

    // The map method will wait for all the promises returned by the insert operation.
    return User.query().map(user => {

        // Generate a random number of journal entries for this user.
        let count = faker.random.number({min: 1, max: 10});
        log("Create %d journal entries for user %d", count, user.id);

        return Promise.all(_.times(count, n => {
            let create_date = faker.date.past(2);
            let update_date = create_date;
            if (chanceIn(2, 5)) {
                update_date = faker.date.between(create_date, today);
            }
            return user.$relatedQuery('journal_entries')
                .insert({
                    title: faker.lorem.sentence(),
                    entry: faker.lorem.paragraphs(),
                    created_at: create_date,
                    updated_at: update_date
                });
        }));
    });
}

exports.seed = function (knex, Promise) {
    return seedVersions().then(() => {
        return seedUsers();
    }).then(() => {
        return seedJournalEntries();
    }).then(
        () => log("SUCCESS"),
        err => console.error("FAIL", err));
};
