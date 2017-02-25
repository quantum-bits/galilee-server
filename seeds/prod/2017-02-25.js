'use strict';

const debug = require('debug')('seed');
const markdown = require('./../markdown');

const ReadingDay = require('../../models/ReadingDay');

const theDate = '2017-02-25';

exports.seed = function (knex, Promise) {
    debug(`RUNNING ${theDate}`);

    return ReadingDay.query().insertGraph({
        date: theDate,
        questions: [],
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
                        practiceId: 7,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`With this Psalm, there is quite a bit going on.
                                 In order to begin memorizing this Psalm, 
                                 starting with verse eleven could be helpful. 
                                 It reads, "Serve the Lord with fear, and rejoice with trembling."
                                 This verse is helpful because it is a specific instruction 
                                 and tells the reader about the Lord's character at the same time. 
                                 Serving the Lord with fear is necessary because He is Holy, 
                                 and rejoicing in the Lord with trembling is noteworthy. 
                                 
                                 Begin with this verse, and continue by memorizing more of the passage, 
                                 or other smaller pieces that stand out to you.`)
                            }
                        ]
                    }
                ]
            },
            {
                seq: 2,
                stdRef: 'Mark 9:9-13',
                osisRef: 'Mark.9.9-Mark.9.13',
                applications: [
                    {
                        seq: 1,
                        practiceId: 1,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`(_JESUS_ and the _DISCIPLES_ are seen 
                                coming down from a mountain.)
                                
                                _JESUS_: Don't tell anyone about what you saw on the mountain 
                                until the Son of Man has risen from the dead.
                                
                                _DISCIPLES_ (to each other): What is this "rising from the dead?"
                                
                                _DISCIPLES_ (to _JESUS_): Why do the teachers of the law say 
                                that Elijah must come first?
                                
                                _JESUS_: To be sure, Elijah does come first, 
                                and restores all things. 
                                Why then is it written that the Son of Man must suffer much 
                                and be rejected? 
                                But I tell you, Elijah has come, 
                                and they have done to him everything they wished, 
                                just as it is written about him.`)
                            }
                        ]
                    },   // application
                ]   // applications
            },
            {
                seq: 3,
                stdRef: '1 Kings 21:20-29',
                osisRef: '1Kgs.21.20-1Kgs.21.29',
                applications: [
                    {
                        seq: 1,
                        practiceId: 13,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`Many drastic things are said in this story. 
                                However, the story ends with hope. 
                                After looking for details in this passage, consider the following questions:
                                
                                1. Why is the Lord upset with Ahab?
                                2. How is God?s character displayed?
                                3. Are there any sins in your life that you would like to confess to the Lord? How can you ask your small group to help you come to Him humbly?`)
                            }
                        ]
                    }  // application
                ]   // applications
            }// reading
        ]   // readings
    }); // insertGraph
};  // function
