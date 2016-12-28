'use strict';

const db = require('../db');

class Collection extends db.Model {
    allResources() {
        return this.resources.map(resource => {
            return {
                description: resource.description,
                url: resource.url,
                copyright_year: resource.copyright_year,
                copyright_owner: resource.copyright_owner,
                tags: resource.tags.map(tag => tag.title)
            }
        })
    }

    static get tableName() {
        return 'collection';
    }

    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'collection.id',
                    through: {
                        from: 'collection_resource.collection_id',
                        to: 'collection_resource.resource_id'
                    },
                    to: 'resource.id'
                }
            },
            readings: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'collection.id',
                    through: {
                        from: 'reading_collection.collection_id',
                        to: 'reading_collection.reading_id',
                        extra: ['advice']
                    },
                    to: 'reading.id'
                }
            }
        }
    }

}

module.exports = Collection;
