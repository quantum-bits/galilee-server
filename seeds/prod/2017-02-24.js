'use strict';

const debug = require('debug')('seed');
const markdown = require('./../markdown');

const ReadingDay = require('../../models/ReadingDay');

const theDate = '2017-02-24';

exports.seed = function (knex, Promise) {
    debug(`RUNNING ${theDate}`);

    return ReadingDay.query().insertGraph({
        date: theDate,
        questions: [],
        readings: [
            {
                seq: 1,
                stdRef: 'Hebrews 11:23-28',
                osisRef: 'Heb.11.23-Heb.11.28',
                applications: [
                    {
                        seq: 1,
                        practiceId: 12,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`As you read through this passage, 
                                ask God for discernment as to what he desires to speak to you through it. 
                                If you are still unsure, ask yourself the following questions. 
                                Afterwards, find someone to discuss them with 
                                in order to come to a better understanding or application of the text.
                                
                                - What does this passage reveal about God?s character?
                                - What does it reveal about people?
                                - Recognizing these things, how can you apply the teachings to your life personally?`)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 12,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`In this passage, 
                                the phrase "by faith" is mentioned four times in five verses. 
                                The first describes Moses' parents 
                                and the following three describe Moses. 
                                Observe the different actions that are taken by Moses and his parents. 
                                Notice their sacrifices as well as rewards. 
                                Discuss the following questions:
                                
                                1. What does God supply in this passage?
                                2. How can you practice your faith this week?
                                3. Finish by reading all of Hebrews 11. May knowing the context encourage you.`)
                            }
                        ]
                    }
                ]
            },
            {
                seq: 2,
                stdRef: 'Psalm 2',
                osisRef: 'Ps.2',
                applications: [
                    {
                        seq: 1,
                        practiceId: 2,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`Hand copy the words of this Psalm 
                                onto a piece of paper or into a journal. 
                                As you write the word of the psalmist, 
                                pay attention to how they strike you. 
                                Did you see anything in a new or different way?`)
                            }
                        ]
                    }   // application
                ]   // applications
            },
            {
                seq: 3,
                stdRef: 'Exodus 19:9b-25',
                osisRef: 'Exod.19.9-Exod.19.25',
                applications: [
                    {
                        seq: 1,
                        practiceId: 13,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`This reading tells 
                                of the Lord's instruction to Moses. 
                                We can see how Moses obediently follows the Lord 
                                and does what He tells Him to do.
                                Discuss the following questions.
                                
                                1. What are significant objects in the passage?
                                2. How does the Lord speak to Moses? What does this reveal about Him?
                                3. How does Moses speak to the Lord? How can his model instruct us in our relationships with God?`)
                            }
                        ]
                    }   // application
                ]   // applications
            }   // reading
        ]   // readings
    }); // insertGraph
};  // function
