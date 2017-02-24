'use strict';

const debug = require('debug')('seed');
const markdown = require('./../markdown');

const ReadingDay = require('../../models/ReadingDay');

const theDate = '2017-MM-DD';

exports.seed = function (knex, Promise) {
    debug(`RUNNING ${theDate}`);

    return ReadingDay.query().insertGraph({
        date: theDate,
        questions: [
            {
                seq: 1,
                text: ''
            },
            {
                seq: 2,
                text: ''
            }
        ],
        readings: [
            {
                seq: 1,
                stdRef: 'Psalm 2',
                osisRef: 'Ps.2',
                applications: [
                    {
                        seq: 1,
                        practiceId: 4,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`1. How might this passage apply to things we are experiencing today?                               
                                2. What does it mean for a nation to serve God?`)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 8,      // Refer to practices table in DB for value
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`Multiline markdown content`)
                            },
                            {
                                seq: 2,
                                description: markdown.convertHtml(``)
                            }
                        ]
                    },
                    {
                        seq: 3,
                        practiceId: 8,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(``)
                            }
                        ]
                    }
                ]
            },
            {
                seq: 2,
                stdRef: '',
                osisRef: '',
                applications: [
                    {
                        seq: 1,
                        practiceId: 12,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(``)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 1,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(``)
                            }
                        ]
                    }   // application
                ]   // applications
            }   // reading
        ]   // readings
    }); // insertGraph
};  // function

exports.seed().then(`${theDate} added`);

