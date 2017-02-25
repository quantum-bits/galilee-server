'use strict';

const debug = require('debug')('seed');
const markdown = require('../markdown');

const ReadingDay = require('../../models/ReadingDay');

const theDate = '2017-02-22';

exports.seed = function (knex, Promise) {
    debug(`RUNNING ${theDate}`);

    return ReadingDay.query().insertGraph({
        date: theDate,
            questions: [
                {
                    seq: 1,
                    text: 'In what ways do we withhold good from one another?'
                },
                {
                    seq: 2,
                    text: `This passage tells us the wise will inherit honor. 
                How do we become wise practically? 
                Is wisdom something we automatically have, or is it something we build over time?`
                }
            ],
            readings: [
                {
                    seq: 1,
                    stdRef: 'Luke 18:18-30',
                    osisRef: 'Luke.18.18-Luke.18.30',
                    applications: [
                        {
                            seq: 1,
                            practiceId: 12,
                            steps: [
                                {
                                    seq: 1,
                                    description: markdown.convertHtml(`Read through this parable slowly, 
                                and do so multiple times to get a better understanding 
                                of what Jesus is attempting to teach the rich man. 
                                What do you learn about the kingdom of God from this passage? 
                                What do you learn about people? 
                                
                                Talk to someone you trust and discuss these questions with them. 
                                Sharing Scripture with other people will lead to deeper engagement with the Word; 
                                in turn, you might come to a deeper understanding of the passage.`)
                                }
                            ]
                        },
                        {
                            seq: 2,
                            practiceId: 1,
                            steps: [
                                {
                                    seq: 1,
                                    description: markdown.convertHtml(`(_RULER_ wearing expensive clothing 
                                        walks in and bows to _JESUS_.)
                                        
                                        _RULER_ (bowing to _JESUS_): Good teacher, what must I do to inherit eternal life?
                                        
                                        _JESUS_: Why do you call me good? No one is good--except God alone.
                                        To inherit eternal life, remember the commandments:
                                        "You shall not commit adultery, you shall not murder, 
                                        you shall not steal, you shall not give false testimony, 
                                        honor your father and mother."
                                        
                                        _RULER_: All these I have kept since I was a boy.
                                        
                                        _JESUS_: You still lack one thing. 
                                        Sell everything you have and give to the poor, 
                                        and you will have treasure in heaven. 
                                        Then come, follow me.
                                        
                                        (The _RULER_ became very sad, and looks at his clothing in disappointment.)
                                        
                                        _JESUS_ (watching the _RULER_): How hard it is for the rich 
                                        to enter the kingdom of God! 
                                        Indeed, it is easier for a camel to go through the eye of a needle 
                                        than for someone who is rich to enter the kingdom of God.
                                        
                                        _CROWD_: Well, who then can be saved?
                                        
                                        _JESUS_: What is impossible with man is possible with God.
                                        
                                        _PETER_: We have left all we had to follow you!
                                        
                                        _JESUS_: Truly I tell you, no one who has left 
                                        home or wife or brothers or sisters or parents or children 
                                        for the sake of the kingdom of God will fail to receive 
                                        many times as much in this age, and in the age to come eternal life.`)
                                }
                            ]
                        }
                    ]
                },
                {
                    seq: 2,
                    stdRef: 'Psalm 119:57-64',
                    osisRef: 'Ps.119.57-Ps.119.64',
                    applications: [
                        {
                            seq: 1,
                            practiceId: 10,
                            steps: [
                                {
                                    seq: 1,
                                    description: markdown.convertHtml(`_We Will Run_ by Gungor
                                
                                In this passage, the psalmist seeks to follow 
                                the commands of God given through his word. 
                                He speaks of not hesitating to do so "with all [his] heart,"
                                and desiring to obey despite his circumstances.
                                
                                As you listen to the given song, meditate on the lyrics prayerfully. 
                                The musicians sing of not merely turning towards God, 
                                but running to him, allowing him to teach his ways. 
                                Rejoice and praise God for the gift we have in his Word! 
                                Take time to find other connections in the song to this particular Psalm.`)
                                }
                            ]
                        }
                    ]
                },
                {
                    seq: 3,
                    stdRef: 'Proverbs 3.27-35',
                    osisRef: 'Prov.3.27-Prov.3.35',
                    applications: [
                        {
                            seq: 1,
                            practiceId: 9,
                            steps: [
                                {
                                    seq: 1,
                                    description: markdown.convertHtml(`Before reading this out loud, 
                                        read it through a couple of times to yourself, 
                                        making sure to also pay attention to the surrounding context 
                                        to get a better idea of what's happening. 
                                        
                                        - Think about a time when you withheld good from someone who deserved it. 
                                        - Think about a time when you have felt the Lord's blessing and favor. 
                                        - Read it in front of your church.`)
                                },
                                {
                                    seq: 2,
                                    description: markdown.convertHtml(`Say this part in a commanding tone 3:27-31
                                        - _Say this part in disgust_: 3:32a
                                        - _Say this part in confidence_: 3:32b
                                        - _Say this part in disgust_: 3:33a
                                        - _Say this part in confidence_: 3:33b
                                        - _Say this part in disgust_: 3:34a
                                        - _Say this part in confidence_: 3:34b
                                        - _Say this part in confidence_: 3:35a
                                        - _Say this part in disgust_: 3:35b`)
                                }
                            ]
                        }
                    ]
                }
            ]   // readings
        }); // insertGraph
};  // function


