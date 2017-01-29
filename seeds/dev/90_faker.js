'use strict';

const Debug = require('debug');
const debug = Debug('seed:debug');
const log = Debug('seed:log');

const random = require('random-js')();
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
            preferredVersionId: random.pick(versionObjects).id
        })
    ))
}

function seedJournalEntries() {
    let today = new Date();

    // The map method will wait for all the promises returned by the insert operation.
    return User.query().map(user => {

        // Generate a list of randomly many random tags for this user.
        let user_tags = _.times(random.integer(3, 10), n => faker.random.word());
        log("Tags are %o", user_tags);

        // Generate a random number of journal entries for this user.
        let entry_count = random.integer(3, 15);
        log("Create %d journal entries for user %d", entry_count, user.id);

        return Promise.all(_.times(entry_count, n => {
            // Set create and update dates for an entry.
            // Sometimes make the update date different.
            let create_date = faker.date.past(2);
            let update_date = create_date;
            if (random.bool(2, 5)) {
                update_date = faker.date.between(create_date, today);
            }

            // Sample the user's tags for this particular entry.
            let entry_tags = random.sample(user_tags, random.integer(0, Math.min(user_tags.length, 5)));

            // Insert the object graph. The graph thing is way cool.
            return user.$relatedQuery('journal_entries')
                .insertGraph({
                    title: faker.lorem.sentence(),
                    entry: faker.lorem.paragraphs(),
                    created_at: create_date,
                    updated_at: update_date,
                    tags: entry_tags.map(tag => {
                        return {
                            user_id: user.id,
                            text: tag
                        };
                    })
                });
        }));
    });
}

// Seed All the Things.
exports.seed = function (knex, Promise) {
    return seedVersions().then(() => {
        return seedUsers();
    }).then(() => {
        return seedJournalEntries();
    }).then(
        () => log("SUCCESS"),
        err => console.error("FAIL", err));
};
