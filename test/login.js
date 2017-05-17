'use strict';

import {initTest, expect, server, db} from './support';
const lab = exports.lab = initTest();
const Practice = require('../models/Practice');

lab.experiment('Test login functionality', () => {
	let testUsers = null;

	lab.beforeEach(done => {
		return db.knew.raw('TRUNCATE public.user CASCADE')
			.then(result => {
				return Promise.all([
					User
						.query()
						.insertGraph({
							email:"bananaBoat@example.com",
							password:"123Test!",
							first_name:"Banana",
							last_name:"Boat",
							joined_on: null,
							enabled: true,
							preferred_versionId: null
						}),
					User
						.query()
						.insertGraph({
							email:"bananaBill@example.com",
							password:"aPassword6",
							first_name:"Bill",
							last_name:"Banana",
							joined_on: null,
							enabled: true,
							preferred_versionId: null
						})
				]).catch(err => {
					console.log("ERROR", err);
				})
			})
			.then(users => {
				testUsers = users;
			})
		})
	



	lab.test("Fetch all users", done => {
		server.inject(
			{
				method: 'GET',
				url:"/users"
			}, res => {
				const response = JSON.parse(res.payload);
				console.log("RES", JSON.stringify(response, null, 4));
				expect(res.statusCode).to.equal(200);
				expect(response).to.have.length(2);
				expect(response[0].password).to.equal("LlamaLlamaDingDong");
				console.log(response[0].password);
				done();				
			});
		});

});
