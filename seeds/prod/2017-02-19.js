'use strict';

const debug = require('debug')('seed');
const markdown = require('../markdown');

const ReadingDay = require('../../models/ReadingDay');

exports.seed = function (knex, Promise) {
    debug("RUNNING 2017-02-19");

    return ReadingDay.query().insertGraph({
        date: '2017-02-19',
        questions: [
            {
                seq: 1,
                text: 'When have you turned the other cheek?'
            }
        ],
        readings: [
            {
                seq: 1,
                stdRef: 'Psalm 119:33-40',
                osisRef: 'Ps.119.33-Ps.119.40',
                applications: [
                    {
                        seq: 1,
                        practiceId: 8,      // Prayer
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`In this passage, the psalmist is specifically asking the Lord
to teach, lead, and provide understanding within his life. 
By praying this Psalm, ask the Lord to do the same 
in your own heart. Simply read through the words, 
multiple times if you feel led, 
and ask God to do in your heart 
as the psalmist originally asked him to do in his. 
Try selecting one of the verses which resonates with you
on a deeper level, and pray more specifically into that; 
this may mean asking God to "turn your eyes from vanity"
in specific areas of your life, 
and to reveal those specific areas to you.`)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 9,      // Public reading
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`Before reading this out loud,
read it through a couple of times to yourself, 
making sure to also pay attention 
to the surrounding context 
to get a better idea of what's happening. 
Think about the things in your life
you need to ask God to turn your heart and eyes from, 
and reflect on the promises He's made.
Read it in front of your church.

- Say this part in humility: 119:33-37
- Say this part with a sense of pleading: 119:38-39
- Say this part in reverence: 119:40`)
                            }
                        ]
                    }
                ]
            },
            {
                seq: 2,
                stdRef: 'Matthew 5:38-48',
                osisRef: 'Matt.5.38-Matt.5.48',
                applications: [
                    {
                        seq: 1,
                        practiceId: 12,     // Speaking
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`Read through this passage slowly and prayerfully. 
Ask the Lord what he desires to speak to you through it 
that you could tell someone you trust about, 
as well as for discernment if he is leading you 
to encourage someone else in your life. 
Is there anyone in your life who struggles with forgiveness, 
someone who would have a difficult time with the command to 
"turn the other cheek" if someone were to 
"strike them on the right cheek?" 
Do you personally find it hard to love those 
with whom the feelings are not mutual, such as your enemies?`)
                            }
                        ]
                    },
                    {
                        seq: 2,
                        practiceId: 1,      // Dramatizing
                        steps: [
                            {
                                seq: 1,
                                description: markdown.convertHtml(`_JESUS_: You have heard that it was said, eye for eye, and tooth for tooth.

(_MAN 1_ and _MAN 2_ act out swapping eyeballs, 
handing them to one another. 
_MAN 1_ and _MAN 2_ act out trading teeth, 
replacing their own with the other person's.)

_JESUS_: But I tell you, do not resist an evil person. 
If anyone slaps you on the right cheek, turn to them the other cheek also.

(_MAN 1_ stage slaps _MAN 2_ on the cheek. 
_MAN 2_ does not cower but confidently turns the other cheek to _MAN 1_. 
_MAN 1_ one proceeds to stage slap _MAN 2_'s other cheek.)

_JESUS_: And if anyone wants to sue you and take your shirt, 
hand over your coat as well. 

(_MAN 1_ asks _MAN 2_ for his shirt. 
_MAN 2_ gives _MAN 1_ his shirt, coat, a scarf, hat, etc. 
The higher number of clothing pieces 
displays more of God's grace in abundance.)

_JESUS_: If anyone forces you to go one mile, 
go with them two miles. 
Give to the one who asks you, 
and do not turn away from the one who wants to borrow from you.

(_MAN 1_ makes _MAN 2_ walk the length of a yardstick. 
_MAN 2_ then leads _MAN 1_ the length of two yardsticks. 
Also, _MAN 1_ asks _MAN 2_ for a handshake and _MAN 2_ firmly gives him one.)

_JESUS_: You have heard that it was said, 
love your neighbor and hate your enemy. 
But I tell you, love your enemies and pray for those who persecute you,
that you may be children of your Father in heaven.

(_MAN 2_ prays for _MAN 1_.)

_JESUS_: The Father causes his sun to rise on the evil and the good, 
and sends rain on the righteous and the unrighteous. 
If you love those who love you, what reward will you get? 
Are not even the tax collectors doing that? 
And if you greet only your own people, what are you doing more than others? 
Do not even pagans do that?

(_MAN 1_ greets _MAN 2_ and asks if he can sit down with him to catch up on life.)

_JESUS_: Be perfect, therefore, as your heavenly Father is perfect.`)
                            }
                        ]
                    }
                ]
            }
        ]
    });
};


