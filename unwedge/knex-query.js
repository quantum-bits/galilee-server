'use strict';

const User = require('../models/User');

console.log("BEFORE");

// If multi-row query (no .first)
//     Then clause gets array containing an object for each row
//     Could be one object for a single row
//     Could be zero objects for an empty result set
//
// If single-row query (using .first)
//     If result set is non-empty
//         Then clause gets single object satisfying query
//     If result set is empty
//         Then clause gets undefined
//
// If the query is broken (e.g., misspelled relation)
//     Catch clause gets error object with this form
//         let err = {
//             Error: {"eager": "unknown relation \"permissons\" in an eager expression"},
//             data: {eager: 'unknown relation "permissons" in an eager expression'},
//             statusCode: 400,
//             message: '{"eager": "unknown relation \"permissons\" in an eager expression"}'
//         }

User.query()
    .where('id', 18)
    .eager('permissions')
    .first()
    .then(result => {
        console.log("THEN", result);
    })
    .catch(err => {
        console.log("CATCH", err);
    })
    .finally(() => {
        console.log("FINALLY");
        process.exit(1);
    });

console.log("AFTER");
