'use strict';

// This file creates a bunch of fake data for Galilee. In general:
// Functions called `random...()` create JSON objects containing an object graph.
// Functions called `seed...()` take those JSON objects and insert them into the database.

const Debug = require('debug');
const debug = Debug('seed:debug');
const log = Debug('seed:log');

const random = require('random-js')();
const faker = require('faker');
const _ = require('lodash');
const moment = require('moment');
const momentRange = require('moment-range').extendMoment(moment);

const Post = require('../../models/Post');
const Reading = require('../../models/Reading');
const ReadingDay = require('../../models/ReadingDay');
const Tag = require('../../models/Tag');
const User = require('../../models/User');
const Version = require('../../models/Version');

// Not sure why the extra array wrapped around these data.
const BibleData = require('../bg_bible_data').data[0];

// Configure seed data generation.
const JOINED_DAYS_AGO = 60;
const NUM_USERS = 10;
const MIN_ENTRIES_PER_USER = 10;
const MAX_ENTRIES_PER_USER = 25;
const MIN_TAGS_PER_USER = 3;
const MAX_TAGS_PER_USER = 10;
const MAX_TAGS_PER_ENTRY = 5;

const versionData = [
    {code: 'ESV', title: 'English Standard Version'},
    {code: 'KJV', title: 'King James Version'},
    {code: 'NASB', title: 'New American Standard Version'},
    {code: 'NIV', title: 'New International Version'},
    {code: 'NKJV', title: 'New King James Version'},
    {code: 'RSV', title: 'Revised Standard Version'}
];
let _versionObjects = [];

function fakeFullName() {
    return `${faker.name.firstName()} ${faker.name.lastName()}`;
}

function seedVersions() {
    debug('seedVersions');
    return Promise.all(versionData.map(datum =>
        Version.query().where('code', datum.code).first().then(result => {
            debug("Result %o", result);
            if (result) {
                // Already have this one in the database. Returning 'result' is
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
            //  2. The promise from the insert was resolved by this 'then' clause.
            // In either case, we now have a version object from the database
            // and can insert it into the list of all versions.
            //
            // Even if the insert failed, we should be okay, because the
            // catch clause will pick it up.
            debug("Adding %o", version)
            _versionObjects.push(version);
        }).catch(err => {
            console.error("ERR", err);
        })
    ));
}

let _randomOrgs = [];

function randomOrg() {
    if (_randomOrgs.length === 0) {
        _randomOrgs = _.times(5, n => ({
            _id: `org-${n}`,
            _used: false,
            name: faker.company.companyName()
        }));
    }

    let org = random.pick(_randomOrgs);
    if (org._used) {
        return {
            "#ref": org._id,
        };
    } else {
        org._used = true;
        return {
            "#id": org._id,
            name: org.name
        };
    }
}

let _randomGroups = null;

function randomGroup() {
    if (_randomGroups === null) {
        _randomGroups = _.times(10, n => ({
            _id: `group-${n}`,
            _used: false,
            name: _.capitalize(faker.lorem.words(random.integer(4, 8)))
        }));
    }

    let group = random.pick(_randomGroups);
    if (group._used) {
        return {
            "#ref": group._id
        };
    } else {
        group._used = true;
        return {
            "#id": group._id,
            name: group.name,
            organization: randomOrg()
        };
    }
}

function randomUser() {
    return {
        email: faker.internet.email(),
        password: 'password',
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        avatarUrl: faker.internet.avatar(),
        joinedOn: faker.date.recent(JOINED_DAYS_AGO),
        preferredVersionId: random.pick(_versionObjects).id,
        groups: _.times(random.integer(1, 2), n => randomGroup())
    }
}

function seedUsers() {
    debug('seedUsers');
    const users = _.times(NUM_USERS, n => randomUser())
    return User.query().insertGraph(users);
}

function seedJournalEntries() {
    debug('seedJournalEntries');
    let today = new Date();

    // The map method will wait for all the promises returned by the insert operation.
    return User.query().map(user => {

        // Generate the random number of journal entries for this user.
        let entryCount = random.integer(MIN_ENTRIES_PER_USER, MAX_ENTRIES_PER_USER);

        // Generate a list of randomly many, unique, random tags for this user.
        let userTags = _.uniq(_.times(random.integer(MIN_TAGS_PER_USER, MAX_TAGS_PER_USER), n => faker.random.word()));
        log("Tags are %o", userTags);

        // Insert the user's tag list into the database.
        return Promise.all(userTags.map(tag =>
            Tag.query().insert({
                userId: user.id,
                label: tag
            })
        )).then(userTagObjects => {

            // Create multiple journal entries for this user.
            return Promise.all(_.times(entryCount, n => {
                // Set entry's create and update dates.
                let createDate = faker.date.recent(JOINED_DAYS_AGO);
                let updateDate = createDate;
                if (random.bool(2, 5)) {
                    // Sometimes change the update date.
                    updateDate = faker.date.between(createDate, today);
                }

                // Insert one journal entry.
                return user.$relatedQuery('journalEntries').insert({
                    title: faker.lorem.sentence(),
                    entry: faker.lorem.paragraphs(),
                    createdAt: createDate,
                    updatedAt: updateDate
                }).then(journalEntry => {
                    // Sample the user's tag objects to use for this entry.
                    let entryTagObjects =
                        random.sample(
                            userTagObjects,
                            random.integer(0, Math.min(userTagObjects.length, MAX_TAGS_PER_ENTRY)));

                    // Relate the journal entry to the tags.
                    return Promise.all(entryTagObjects.map(tagObject =>
                        journalEntry.$relatedQuery('tags').relate(tagObject)));
                });
            }));
        });
    });
}

function randomReference() {
    let book = faker.random.arrayElement(BibleData.books);
    let chapter = random.integer(1, book.chapters);
    let startVerse = random.integer(1, book.verses[chapter - 1]);
    let endVerse = random.integer(startVerse, book.verses[chapter - 1]);

    let stdRef = `${book.display} ${chapter}:${startVerse}`;
    let osisRef = `${book.osis}.${chapter}.${startVerse}`;
    if (startVerse < endVerse) {
        stdRef += `-${endVerse}`;
        osisRef += `-${book.osis}.${chapter}.${endVerse}`;
    }

    return {
        stdRef: stdRef,
        osisRef: osisRef
    };
}

let _practiceObjects = null;

function randomPractices() {
    const baseUrl = 'https://www.biblegateway.com/resources/scripture-engagement';
    if (_practiceObjects === null) {
        const practiceData = [
            {title: 'Dramatizing Scripture', url: baseUrl + '/dramatizing-scripture/home'},
            {title: 'Hand Copying Scripture', url: baseUrl + '/hand-copying-scripture/home'},
            {title: 'The Ignatian Method', url: baseUrl + '/ignatian-method/home'},
            {title: 'Journaling Scripture', url: baseUrl + '/journaling-scripture/home'},
            {title: 'Lectio Divina', url: baseUrl + '/lectio-divina/home'},
            {title: 'Manuscript Bible Study', url: baseUrl + '/manuscript-bible-study/home'},
            {title: 'Memorizing Scripture', url: baseUrl + '/scripture-memorization/home'},
            {title: 'Praying Scripture', url: baseUrl + '/praying-scripture/home'},
            {title: 'Public Reading of Scripture', url: baseUrl + '/public-reading-scripture/home'},
            {title: 'Scripture Engagement Through Visual Art', url: baseUrl + '/art/home'},
            {title: 'Singing Scripture', url: baseUrl + '/singing-scripture/home'},
            {title: 'Speaking Scripture', url: baseUrl + '/speaking-scripture/home'},
            {title: 'Storying Scripture', url: baseUrl + '/storying-scripture/home'},
            {title: 'Engaging Scripture in Community', url: baseUrl}
        ];

        _practiceObjects = _.map(practiceData, (data, idx) => ({
            _id: `practice-${idx}`,
            _used: false,
            title: data.title,
            infoUrl: data.url
        }));
    }

    // Shuffle in place.
    random.shuffle(_practiceObjects);

    return _.map(_.take(_practiceObjects, random.integer(2, 3)), pracObj => {
        if (pracObj._used) {
            return {
                "#ref": pracObj._id
            };
        } else {
            pracObj._used = true;
            return {
                "#id": pracObj._id,
                title: pracObj.title,
                summary: `Summary of ${pracObj.title}`,
                infoUrl: pracObj.infoUrl
            };
        }
    });
}

function randomSteps() {
    return _.times(random.integer(0, 3), n => ({
        seq: n + 1,
        description: `Step ${n + 1}`
    }));
}

function randomResources() {
    let currentDate = new Date();

    User.query()
        .then(users => {
            return _.times(random.integer(0, 3), n => {
                return {
                    seq: n + 1,
                    title: _.capitalize(faker.lorem.words(random.integer(4, 7))),
                    description: faker.lorem.paragraphs(random.integer(1, 3)),
                    userId: random.pick(users).id,
                    source: 'Generated by Faker',
                    importDate: faker.date.recent(30),
                    creator: fakeFullName(),
                    creationDate: faker.date.past(currentDate, 200),
                    copyrightDate: faker.date.past(currentDate, 100),
                    notes: faker.lorem.paragraph(),
                    height: random.integer(768, 2048),
                    width: random.integer(1024, 4096),
                    // duration:
                    medium: faker.lorem.words(3),
                    // physicalDimensions:
                };
            });
        });
}

function randomDirections() {
    return _.map(randomPractices(), (practice, index) => ({
        practice: practice,
        seq: index + 1,
        steps: randomSteps()
    }));
}

function randomReadings() {
    return _.times(random.integer(0, 3), n => {
        let ref = randomReference();
        return {
            seq: n + 1,
            stdRef: ref.stdRef,
            osisRef: ref.osisRef,
            directions: randomDirections()
        };
    });
}

function seedReadingDays() {
    debug('seedReadingDays');
    const startDate = moment().subtract(30, 'days');
    const endDate = moment().add(30, 'days');
    const range = momentRange.range(startDate, endDate);

    const readingDays = _.map(Array.from(range.by('days')), currentDate => ({
        date: currentDate.format('YYYY-MM-DD'),
        directions: randomDirections(),
        readings: randomReadings()
    }));
    return ReadingDay.query().insertGraph(readingDays);
}

function seedForumPosts() {
    debug('seedForumPosts');
    return Promise.all([
        // Get all the readings and users.
        Reading.query(),
        User.query().eager('groups')
    ]).then(([readings, users]) => {
        // For each user with at least one group
        return Promise.all(users.filter(user => user.groups.length > 0).map(user =>
            // For a random number of times
            Promise.all(_.times(random.integer(2, 10), n =>
                // Create a post for this user.
                Post.query().insert({
                    title: random.bool(0.4) ? _.capitalize(faker.lorem.words(random.integer(4, 7))) : '',
                    content: faker.lorem.paragraphs(random.integer(1, 3)),
                    userId: user.id,
                    groupId: random.pick(user.groups).id,
                    readingId: random.bool(0.75) ? random.pick(readings).id : null
                })
            ))
        ))
    });
}

// Seed All the Things.
exports.seed = function (knex, Promise) {
    // N.B., order matters in the following promise chain!
    return seedVersions()
        .then(() => seedUsers())
        .then(() => seedJournalEntries())
        .then(() => seedReadingDays())
        .then(() => seedForumPosts())
        .then(() => log("SUCCESS"))
        .catch(err => console.error("FAIL", err));
};
