'use strict';

const debug = require('debug')('seed');
const markdown = require('../markdown');

const ReadingDay = require('../../models/ReadingDay');

const theDate = '2017-02-21';

exports.seed = function (knex, Promise) {
    debug(`RUNNING ${theDate}`);

    return ReadingDay.query().insertGraph({
        date: theDate,
        questions: [
            {
                seq: 1,
                text: 'How difficult is it to strive to have peace with everyone?'
            },
            {
                seq: 2,
                text: 'Who is someone that you need to work toward peace and reconciliation in your relationship with?'
            },
            {
                seq: 3,
                text: 'What "roots of bitterness" spring up in our lives today? How can we refrain from bitterness?'
            }
        ],
        readings: [
            {
                seq: 1,
                stdRef: 'Hebrews 12:14-16',
                osisRef: 'Heb.12.14--Heb.12.16',
                applications: [
                    {
                        seq: 1,
                        practiceId: 12,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`The author of Hebrews 
                                ends this chapter by encouraging believers to ?
                                "live in peace with everyone and to be holy" so that others may "see the Lord" (12:14).
                                 As you read through this passage, 
                                 what parts stand out to you that the Lord is impressing on you in particular? 
                                 
                                 For example, is there anyone in your life who lives in a way 
                                 that others see Christ in them? 
                                 Encourage them and the ways they do so by speaking this passage to them. 
                                 Do you have a desire to rid yourself of bitterness 
                                 so that it does not take root and harm others? 
                                 Share this with a person you trust so that they can hold you accountable 
                                 to releasing harbored grudges.`)
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
                        practiceId: 7,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`When memorizing this passage, 
                                begin with the first few verses of the Psalm. 
                                If you are more familiar with the process of memorizing scripture, 
                                challenge yourself and select a larger portion (if not the entire portion) 
                                and try to memorize it bit by bit as you become more familiar with the passage. 
                                As you memorize, remind yourself of situations 
                                in which the Word would be helpful to call upon, 
                                and motivate yourself knowing the Word of God is a powerful tool.`)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 8,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`As you read through this Psalm 
                                and pray through the verses, recognize how the focus is upon God?s holiness. 
                                God is holy because He is unlike us. 
                                Focus your prayers today on this attribute of God, 
                                and praise Him for all that He has done and all that He is doing.`)
                            }
                        ]
                    },
                    {
                        seq: 3,
                        practiceId: 9,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`Before reading this out loud, 
                                read it through a couple of times to yourself, 
                                making sure to also pay attention to the surrounding context 
                                to get a better idea of what?s happening. 
                                Think about the laws the Lord has created and why they were created, 
                                as well as how you respond to those laws. 
                                Think about someone who reflects the image David talks about it this passage. 
                                Read it in front of your church.
                                
                                - _Say this part with earnest appeal_: 119:57-58
                                - _Say this part with power_: 119:59-62
                                - _Say this part humble submission_: 119:63-64`)
                            }
                        ]
                    }   // application
                ]   // applications
            },
            {
                seq: 3,
                stdRef: 'Genesis 31:17-50',
                osisRef: 'Gen.31.17-Gen.31.50',
                applications: [
                    {
                        seq: 1,
                        practiceId: 1,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`(The scene opens with _JACOB_ 
                                putting his CHILDREN and his WIVES on camels, 
                                with all his livestock ahead of him, 
                                along with all the goods he had accumulated in Paddan Aram, 
                                to go to his father ISAAC in the land of Canaan.
                                
                                Meanwhile, _LABAN_ is seen leaving to shear his sheep 
                                and _RACHEL_ is seen stealing her father's household gods.)
                                
                                _NARRATOR_: Jacob deceived Laban the Aramean 
                                by not telling him he was running away. 
                                So he fled with all he had, crossed the Euphrates River, 
                                and headed for the hill country of Gilead.
                                
                                On the third day Laban was told that Jacob had fled. 
                                Taking his relatives with him, he pursued Jacob for seven days 
                                and caught up with him in the hill country of Gilead. 
                                
                                (_LABAN_ is sleeping deeply. 
                                _GOD_ is seen next to _LABAN_ and speaks to him as he dreams.)
                                
                                _GOD_: Be careful not to say anything to Jacob, either good or bad.
                                
                                _NARRATOR_: Jacob had pitched his tent in the hill country of Gilead when 
                                Laban overtook him, and Laban and his relatives camped there too.
                                
                                _LABAN_: What have you done? You've deceived me, 
                                and you've carried off my daughters like captives in war.
                                Why did you run off secretly and deceive me? 
                                Why didn't you tell me, 
                                so I could send you away with joy and singing 
                                to the music of timbrels and harps? 
                                You didn't even let me kiss my grandchildren and daughters goodbye.
                                You have done a foolish thing. 
                                I have the power to harm you; 
                                but last night the God of your father said to me,
                                "Be careful not to say anything to Jacob, either good or bad." 
                                Now you have gone off because you longed to return 
                                to your father's household. 
                                But why did you steal my gods?
                                
                                _JACOB_: I was afraid, because I thought 
                                you would take your daughters away from me by force. 
                                But if you find anyone who has your gods, that person shall not live. 
                                In the presence of our relatives, see for yourself 
                                whether there is anything of yours here with me; and if so, take it.
                                
                                _NARRATOR_: Now Jacob did not know that Rachel had stolen the gods.
                               
                               (_LABAN_ goes into _JACOB_'s tent and into _LEAH_'s tent 
                               and into the tent of the two female servants, 
                               but finds nothing. 
                               After he comes out of _LEAH_'s tent, he enters _RACHEL's tent.) 
                               
                               _NARRATOR_: Now Rachel had taken the household gods 
                               and put them inside her camel's saddle and was sitting on them.
                               
                               (_LABAN_ searches through everything in the tent but finds nothing.)
                               
                               _RACHEL_: Don't be angry, my lord, 
                               that I cannot stand up in your presence; I'm having my period.
                               
                               (_LABAN_ searches but cannot find the household gods.)
                               
                               _JACOB_ (angrily to _LABAN_): What is my crime? 
                               How have I wronged you that you hunt me down? 
                               Now that you have searched through all my goods, 
                               what have you found that belongs to your household? 
                               Put it here in front of your relatives and mine, 
                               and let them judge between the two of us. 
                               I have been with you for twenty years now. 
                               Your sheep and goats have not miscarried, 
                               nor have I eaten rams from your flocks. 
                               I did not bring you animals torn by wild beasts; 
                               I bore the loss myself. 
                               And you demanded payment from me for whatever was stolen by day or night. 
                               This was my situation: 
                               The heat consumed me in the daytime and the cold at night, 
                               and sleep fled from my eyes. 
                               It was like this for the twenty years I was in your household. 
                               I worked for you fourteen years for your two daughters and six years for your flocks, 
                               and you changed my wages ten times. 
                               If the God of my father, the God of Abraham and the of Isaac,
                               had not been with me, you would surely have sent me away empty-handed. 
                               But God has seen my hardship and the toil of my hands, and last night he rebuked you.
                               
                               _LABAN_: The women are my daughters, the children are my children, 
                               and the flocks are my flocks. All you see is mine. 
                               Yet what can I do today about these daughters of mine, 
                               or about the children they have borne? 
                               Come now, let's make a covenant, you and I, 
                               and let it serve as a witness between us.
                               
                               (_JACOB_ takes a stone and sets it up as a pillar.)
                               
                               _JACOB_ (to his relatives): Gather some stones.
                               
                               (The relatives take stones and pile them in a heap, and they eat there by the heap.)
                               
                               _NARRATOR_: Laban called it Jegar Sahadutha, and Jacob called it Galeed.
                               
                               _LABAN_: This heap is a witness between you and me today.
                               
                               _NARRATOR_: That is why the place was called Galeed. 
                               It was also called Mizpah, because Laban said to Jacob ...
                               
                               _LABAN_ (interrupting the _NARRATOR_): May the Lord keep watch 
                               between you and me when we are away from each other. 
                               If you mistreat my daughters or if you take any wives besides my daughters, 
                               even though no one is with us, 
                               remember that God is a witness between you and me.`)
                            }
                        ]
                    }   // application
                ]   // applications
            }   // reading
        ]   // readings
    }); // insertGraph
};  // function


