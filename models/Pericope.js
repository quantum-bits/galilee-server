'use strict';

const db = require('../db');

class Pericope extends db.Model {
    static get tableName() {
        return 'pericope';
    }

    fullReference() {
        return this.passages.map(passage => passage.reference()).join(' ');
    }

    fullText() {
        return this.passages.map(passage => passage.text).join(' ');
    }

    allPractices() {
        return this.practices.map(practice => {
            return {
                title: practice.title,
                description: practice.description,
                advice: practice.advice
            };
        })
    }

    allCollections() {
        return this.collections.map(collection => {
            return {
                title: collection.title,
                description: collection.description,
                advice: collection.advice,
                resources: collection.allResources()
            };
        })

    }

    static get relationMappings() {
        return {
            reading: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'pericope.reading_id',
                    to: 'reading.id'
                }
            },
            passages: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Passage',
                join: {
                    from: 'pericope.id',
                    to: 'passage.pericope_id'
                }
            },
            practices: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'pericope.id',
                    through: {
                        from: 'pericope_practice.pericope_id',
                        to: 'pericope_practice.practice_id',
                        extra: ['advice']
                    },
                    to: 'practice.id'
                }
            },
            collections: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Collection',
                join: {
                    from: 'pericope.id',
                    through: {
                        from: 'pericope_collection.pericope_id',
                        to: 'pericope_collection.collection_id',
                        extra: ['advice']
                    },
                    to: 'collection.id'
                }
            }
        }
    }

}

module
    .exports = Pericope;
