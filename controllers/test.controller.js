const mongoose = require('mongoose');
const express = require('express');
const testRouter  = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const events = require('events');
// const nodemailer = require('nodemailer');
// const passport = require('passport');

//const userRouter  = express.Router();

// const userModel = mongoose.model('User');
// const socialModel = mongoose.model('SocialUser');
const testModel = mongoose.model('Test');
const questionModel = mongoose.model('Question');
//const performanceModel = mongoose.model('Performance');
 
//libraries and middlewares
//const config = require('./../../config/config.js');
//const responseGenerator = require('./../../libs/responseGenerator');
//const auth = require("./../../middlewares/auth");
//const random = require("randomstring");
const uuidv1 = require('uuid/v1');


// *********** ALL API'S ********************//



module.exports.controller = (app)=>{
	// API to get a complete details of test


	testRouter.get('/test/testinit/:tid', function (req, res) {
			//console.log("/test/:tid req.params = " + JSON.stringify(req.params));
			//console.log("/test/:tid req.params.tid = " + JSON.stringify(req.params.tid));
		    testModel.findOne({
		    	'id': req.params.tid
		    },  (err, result) =>{
		    	if (err) {
		    		//let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
		    		res.send({isError: false, msg: "We are experiencing some issues please try again later", response: 500, data: null});
		    	} else {	
					let sessionUUID = uuidv1();		
					//console.log("/test/:tid result = " + result);		
					//let response = responseGenerator.generate(false, "Test Details", 200, result);
					//console.log(" /test/:tid " + JSON.stringify(response));
		    		res.send({isError: false, msg: "Test initiated", response: 200, data: {uid: sessionUUID, result: result}});
		    	}
			});
			
		});

	testRouter.get('/checkAnswer/:qid/:answId', function (req, res) {
		//console.log("/checkAnswer/:qid/:answId req.params = " + JSON.stringify(req.params));
		questionModel.findOne({
			'id':req.params.qid
		}, (err, result) =>{
			if (err) {
				//let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send({isError: false, msg: "We are experiencing some issues please try again later", response: 500, data: null});
			} else {		

				//let response = responseGenerator.generate(false, "Test Details", 200, result);
				//console.log("/checkAnswer/:qid/:answId response = " + JSON.stringify(response));
				res.send({isError: false, msg: "We are experiencing some issues please try again later", response: 200, data: result});
			}
		});
	});

	//to get next question REFACTORING!!!! I don't like tis req.params.data dependency in the first callback I don't trust it
		testRouter.get('/getNextQuestion/:tid/:data',  (req, res)=> {
			//console.log("*********************getNextQuestion START*********************");
			//transforming string data to array
			req.params.data = JSON.parse(req.params.data); 
			//getting test data, in general we need which questions are linked to this particular test. REFACTORING
			testModel.findOne({
				'id': req.params.tid				
			},  (err, test)=> {
				if (err) {
					//fatal error
					 let error = "error";
					 res.send({isError: false, msg: "We are experiencing some issues please try again later", response: 500, data: null});
				} else if (test === null || test === undefined || test === []) {
					//No more questions found, however should. REFACTORING: more contorl on requests. This should not happen in a ususal flow
					let error = "error";
					res.send({isError: false, msg: "We are experiencing some issues please try again later", response: 204, data: null});
				} else {
					//Second part of execution. We are looking for one more question. Adding some variables for better understanding
					let questions = test.questions; //questions - array of all questions in the test					
					//console.log("getNextQuestion: list of  questions in the test: " + test.questions);
					//console.log("getNextQuestion: 2nd element in questions: " + test.questions[1]);
					let removeQuestions = req.params.data; //removeQuestions - array of questions already shown to the User (comes from UI)
					//console.log("getNextQuestion: list of answered questions: " + removeQuestions);
					//console.log("getNextQuestion: 1st element in answered questions: " + removeQuestions[0]);

					//I do not know how to pass additional parameters to callbacks. 
					//REFACTORING: probably might cause issues in concurrent env
					//adding on more attribute to req.params and filtering out answered questions
					
					let filteredQuestions; 
					if (Array.isArray(removeQuestions))
						filteredQuestions = questions.filter((el) => !removeQuestions.includes(el));
					else
						filteredQuestions = questions;
					//DEBUG
					//let filteredQuestions = questions.filter( function( el ) {
					//	console.log("FILTERING QUESTIONS: type of el = " + typeof el);	
					//	console.log("FILTERING QUESTIONS: type of removeQuestions el = " + typeof removeQuestions[0]);	
					// console.log("FILTERING QUESTIONS: el = " + el);	
					// console.log("FILTERING QUESTIONS: removeQuestions = " + removeQuestions);	
					// console.log("FILTERING QUESTIONS: removeQuestions includes " + el + " = " + removeQuestions.includes(el));	
					//	return !removeQuestions.includes(el);
					//} );

					//DEBUG	
					//console.log("getNextQuestion: list of NOT answered questions: " + filteredQuestions);

					//Picking up one random id from the list of unanswered questions
					if (filteredQuestions.length>0) {
					let chosenId = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
					// console.log("test.controller.js getNextQuestion: chosenId: " + chosenId);
					
					//******************callback hell********************** REFACTORING
					
					//Getting chosen question data
					questionModel.findOne({
						'id': chosenId
						}, (err, question)=> {
							if (err) {
										//fatal error
								 		//let error = responseGenerator.generate(true, "We are experiencing some issues please try again later", 500, null);
								 		res.send({isError: false, msg: "We are experiencing some issues please try again later", response: 500, data: null});
									 }
									else if (test === null || test === undefined || test === []) {
										//No more questions found, however should
										let error = {isError: false, msg: "We are experiencing some issues please try again later", response: 204, data: null};
										//responseGenerator.generate(false, "We are experiencing some issues please try again later", 204, null);
										res.send("error");
									}
									else {
										console.log("test.controller.js getNextQuestion: featched question: " + question);
										let response = {isError: false, msg: "Question fetched", response: 200, data: question};
										res.send(response);
									}							
						});
					//******************callback hell**********************
					} else {
						let error = {isError: false, msg: "No more questions", response: 204, data: null};
						res.send(error);
					}
				}			
			});						
		});		


	//app.use('/user',auth.verifyToken,testRouter);		
	app.use('/api',testRouter);		


}


