'use strict';

const debug = require('debug')('seed');
const markdown = require('../markdown');

const ReadingDay = require('../../models/ReadingDay');

const theDate = '2017-02-20';

exports.seed = function (knex, Promise) {
    debug(`RUNNING ${theDate}`);

    return ReadingDay.query().insertGraph({
        date: theDate,
        questions: [
            {
                seq: 1,
                text: 'What parts of this passage are figurative and what parts of it do you think are literal?'
            },
            {
                seq: 2,
                text: 'How do these metaphors apply to us today?'
            }
        ],
        readings: [
            {
                seq: 1,
                stdRef: 'Proverbs 25:11-22',
                osisRef: 'Pr.25.11-Pr.25.22',
                applications: [
                    {
                        seq: 1,
                        practiceId: 12,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`This proverb holds 
                                numerous pieces of advice and wisdom that can be applied to one's life.
                                You may need to read through it multiple times, 
                                but as you do, which verses stand out to you 
                                that you can speak into another person's life? 
                                Which verses stand out as ones that you can ask and receive encouragement 
                                from someone else in your own life? 
                                For example, you might know someone who struggles 
                                with generosity and bitterness against those who have hurt them; 
                                embolden them to love their enemies through serving them, 
                                knowing that the Lord will honor them in it. 
                                
                                What other words of wisdom from this proverb can you tell someone in your life?`)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 8,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`This passage includes many great opportunities 
                                for more personal prayer. 
                                As you read through the Psalm, 
                                pray more deeply into parts which resonate with you today. 
                                For example, after the phrase "be gracious to me according to your promise",
                                specify areas in which you are asking to receive God's grace.
                                Pray and ask the Holy Spirit to guide you to areas 
                                in your life which you need to recognize the need for God's grace in your life. 
                                Pray more deeply into other verses within the psalm in a similar manner.`)
                            }
                        ]
                    }
                ]
            },
            {
                seq: 2,
                stdRef: 'Romans 12.9-21',
                osisRef: 'Ro.12.9-Ro.12.21',
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
                                Think about what this passage would look like if applied literally in your life.
                                Are there aspects of your life you need to change 
                                in order to follow this passage for what it says? 
                                Read it in front of your church.
                                
                                Say this passage slowly and deliberately, emphasizing the verbs`)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 1,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`_PAUL_: Love must be sincere. Hate what is evil; 
                                cling to what is good. 
                                Be devoted to one another in love. 
                                Honor one another above yourselves.
                                
(_MAN 1_ honors _MAN 2_.)

_PAUL_: Never be lacking in zeal, but keep your spiritual fervor, serving the Lord.
 
(_MAN 1_ mops the floor joyously, smiling and swaying, as if to music.)

_PAUL_: Be joyful in hope, patient in affliction, faithful in prayer. Share with the Lord's people who are in need. Practice hospitality.

(_MAN 1_ displays joy. _MAN 2_ receives a disheartening letter and then prays. _MAN 3_ invites _HOMELESS MAN_ into his home and offers him food.)

_PAUL_: Bless those who persecute you; 
bless and do not curse. 
Rejoice with those who rejoice; 
mourn with those who mourn. 
Live in harmony with one another. 

(_MAN 2_ encourages _MAN 1_. _MAN 1_ rejoices. _MAN 2_ rejoices. 
_MAN 1_ mourns. _MAN 2_ mourns.)

_PAUL_: Do not be proud, but be willing to associate with people of low position.
Do not be conceited.

(_WOMAN 1_ wears a beautiful dress. 
_WOMAN 2_ wears a crummy shirt and dirty jeans. 
_WOMAN 1_ invites _WOMAN 2_ to eat with her.)

_PAUL_: Do not repay anyone evil for evil. 
Be careful to do what is right in the eyes of everyone. 
If it is possible, as far as it depends on you, 
live at peace with everyone. 
Do not take revenge, my dear friends, 
but leave room for God's wrath, 
for it is written: "It is mine to avenge; I will repay," says the Lord.

(_WOMAN 3_ pushes _WOMAN 4_. _WOMAN 4_ begins to push back, 
then thinks better of it and walks away from _WOMAN 3_.)

_PAUL_: On the contrary:
If your enemy is hungry, feed him;
if he is thirsty, give him something to drink.
In doing this, you will heap burning coals on his head.
Do not be overcome by evil, but overcome evil with good.`)
                            }
                        ]
                    }   // application
                ]   // applications
            }   // reading
        ]   // readings
    }); // insertGraph
};  // function
