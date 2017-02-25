'use strict';

const debug = require('debug')('seed');
const markdown = require('./../markdown');

const ReadingDay = require('../../models/ReadingDay');

const theDate = '2017-02-26';

exports.seed = function (knex, Promise) {
    debug(`RUNNING ${theDate}`);

    return ReadingDay.query().insertGraph({
        date: theDate,
        questions: [],
        readings: [
            {
                seq: 1,
                stdRef: '2 Peter 1:16-21',
                osisRef: '2Pet.1.16-2Pet.1.21',
                applications: [
                    {
                        seq: 1,
                        practiceId: 10,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`_Well Pleased_ by FFH
                                
                                In this passage, Peter speaks of the fulfillment 
                                of Christ as prophesied by the Scriptures, 
                                his eyewitness testimony to it, 
                                and how we can have confidence in who Christ is: 
                                the Son of God. 
                                
                                Verse 17 includes a reference found also in Matthew 17, 
                                Mark 9, and Luke 9, saying, 
                                "This is my Son, my Beloved, with whom I am well pleased," 
                                which confirmed Christ as the Son of God.
                                
                                Take time to listen to the song _Well Pleased_ by FFH,
                                and pay close attention as the singer repeats the line 
                                "You are the child that I love in you I am well pleased." 
                                Meditate on the lyrics as he continues to sing 
                                of the relational aspect between the Father and Son, 
                                as well as the beauty found therein.`)
                            }
                        ]
                    }
                ]
            },
            {
                seq: 2,
                stdRef: 'Matthew 17:1-9',
                osisRef: 'Matt.17.1-Matt.17.9',
                applications: [
                    {
                        seq: 1,
                        practiceId: 3,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`Imagine you are one of the three 
                                that Jesus takes up with him to the mountain. 
                                Imagine your journey up the mountain. 
                                What are your thoughts on the journey up the mountain? 
                                What is running through your head? 
                                What might you be talking to the other two or Jesus about? 
                                Would you be asking him questions?
                                
                                When Jesus is transfigured before you, what is your reaction?
                                What is your reaction when you see Moses and Elijah appear?
                                What is everyone else's reaction?
                                
                                What are your thoughts of what Peter says to Jesus? 
                                
                                What was your reaction when you heard the voice of God?
                                Was it the same as everyone else's?
                                
                                How did you feel when Jesus came, touched you, 
                                and told you to not be afraid? 
                                Were you surprised that only Jesus was there?`)
                            }
                        ]
                    }   // application
                ]   // applications
            },
            {
                seq: 3,
                stdRef: 'Exodus 24:12-18',
                osisRef: 'Exod.24.12-Exod.24.18',
                applications: [
                    {
                        seq: 1,
                        practiceId: 13,
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`The Lord invites Moses to come to Him.
                                 This story has rich historical value, 
                                 but also displays God and His relationship with Moses.
                                 
                                 1. Who is in this passage? Where are they in relation to the mountain?
                                 2. Where else in Scripture is the glory of the Lord described?
                                 3. Think of a time when you have seen God display His glory. Share it with one another.`)
                            }
                        ]
                    }   // application
                ]   // applications
            }   // reading
        ]   // readings
    }); // insertGraph
};  // function

exports.seed().then(`${theDate} added`);
process.exit(0);
