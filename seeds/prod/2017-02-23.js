'use strict';

const debug = require('debug')('seed');
const markdown = require('./../markdown');

const ReadingDay = require('../../models/ReadingDay');

const theDate = '2017-02-23';

exports.seed = function (knex, Promise) {
    debug(`RUNNING ${theDate}`);

    return ReadingDay.query().insertGraph({
        date: theDate,
        questions: [
        ],
        readings: [
            {
                seq: 1,
                stdRef: 'Psalm 2',
                osisRef: 'Ps.2',
                applications: [
                    {
                        seq: 1,
                        practiceId: 12,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`Before reading this out loud, 
                                read it through a couple of times to yourself, 
                                making sure to also pay attention to the surrounding context 
                                to get a better idea of what?s happening. 
                                Think about a time when you have felt God's wrath. 
                                Picture yourself the king of a nation who is experiencing God's wrath.
                                Read it in front of your church.
- _Say this part as a question_: 2:1
- _Say this part in a rebellious_: tone 2:2-3
- _Say this part in a mocking way_: 2:3-6
- _Say this part in victory_: 2:7-9
- _Say this part as a final warning_: 2:10-12`)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 6,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`As you read this Psalm 
                                highlight words that stand out to you. 
                                Underline words that are connected to each other. 
                                When you're finished, 
                                observe what words you highlighted 
                                and think about why they stuck out to you. 
                                Look at the word you underlined and try to create connections and themes.`)
                            }
                        ]
                    }
                ]
            },
            {
                seq: 2,
                stdRef: 'Exodus 6:2-9',
                osisRef: 'Exod.6.2-Exod.6.9',
                applications: [
                    {
                        seq: 1,
                        practiceId: 1,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`_GOD_ (to _MOSES_): I am the Lord. 
                                I appeared to Abraham, to Isaac and to Jacob as God Almighty, 
                                but by my name the Lord I did not make myself fully known to them. 
                                I also established my covenant with them to give them the land of Canaan, 
                                where they resided as foreigners. 
                                Moreover, I have heard the groaning of the Israelites, 
                                whom the Egyptians are enslaving, and I have remembered my covenant.
                                
                                _GOD_: Therefore, tell the Israelites, "I am the Lord, 
                                and I will bring you out from under the yoke of the Egyptians.
                                I will free you from being slaves to them, 
                                and I will redeem you with an outstretched arm and with mighty acts of judgment. 
                                I will take you as my own people, and I will be your God. 
                                Then you will know that I am the Lord your God, 
                                who brought you out from under the yoke of the Egyptians. 
                                And I will bring you to the land I swore with uplifted hand
                                to give to Abraham, Isaac and to Jacob. I will give it to you as a possession. 
                                I am the Lord."
                                
                                _MOSES_: Israelites, listen to what the Lord has instructed me to tell you.
                                
                                _ISRAELITES_: We will not listen. We have work to do.`)
                            }
                        ]
                    }  // application
                ]   // applications
            }   // reading
        ]   // readings
    }); // insertGraph
};  // function

