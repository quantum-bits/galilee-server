'use strict';

const Practice = require('../../models/Practice');
const Collection = require('../../models/Collection');

exports.seed = function (knex, Promise) {

    return Promise.all([
        knex('resource_tag').del(),
        knex('tag').del(),
        knex('practice_resource').del(),
        knex('collection_resource').del(),
        knex('resource').del(),
        knex('resource_type').del(),
        knex('practice').del(),
        knex('collection').del(),
    ]).then(result => {
        return Promise.all([
            Practice.query().insertWithRelated({
                title: "Lectio Divina",
                description: "Description of Lectio Divina",
                resources: [
                    {
                        description: 'More Information',
                        url: 'https://www.biblegateway.com/resources/scripture-engagement/lectio-divina/home',
                        type: {
                            title: 'Link',
                            icon: 'link-icon',
                            "#id": 'resource-type-link'
                        }
                    }
                ]
            }),

            Practice.query().insertWithRelated({
                title: "Journaling Scripture",
                description: "Description of Journaling Scripture"
            })
        ])
    });
};
