'use strict';

const CalendarDate = require('../../models/CalendarDate');
const Pericope = require('../../models/Pericope');

exports.seed = function (knex, Promise) {

    let pericopes = [];
    let calendar_date = null;

    return knex('pericope_date').del()
        .then(knex('calendar_date').del())
        .then(knex('calendar_year').del)
        .then(knex('cycle').del)

        .then(() => {
            Cycle.query().insertWithRelated({
                title: 'C',
                years: [
                    {
                        year: 2016,
                        advent_begins: '2016-12-05',
                        easter_date: '2016-05-01',
                        dates: [
                            {
                                month: 7,
                                date: 26
                            }
                        ]
                    }
                ]
            })
        })

        .catch(err => console.error(err))
};

//         .insert()
//         .then(cd => calendar_date = cd);
//     console.log(`CAL DATE ${calendar_date}`);
// })
//
// .then(() => {
//     Pericope.query().then(result => pericopes = result)
// })
//
// .then(() => {
//     calendar_date
//         .$relatedQuery('pericopes')
//         .relate(pericopes.map(pericope => pericope.id))
// })
