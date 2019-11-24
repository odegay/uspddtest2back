const mongoose = require('mongoose');
const express = require('express');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const events = require('events');
// const nodemailer = require('nodemailer');
// const passport = require('passport');

//const userRouter  = express.Router();
const editRouter  = express.Router();
// const userModel = mongoose.model('User');
// const socialModel = mongoose.model('SocialUser');
const testModel = mongoose.model('Test');
const questionModel = mongoose.model('Question');
 
//libraries and middlewares
//const config = require('./../../config/config.js');
//const responseGenerator = require('./../../libs/responseGenerator');
//const auth = require("./../../middlewares/auth");
//const random = require("randomstring");
//const uuidv1 = require('uuid/v1');


// *********** ALL API'S ********************//



module.exports.controller = (app)=>{
	// API to get a complete details of test
	editRouter.get('/edit/initEdit/', function (req, res) {
			// console.log("editcontroller /initEdit/ req.params = " + JSON.stringify(req.params));
		    questionModel.find({
		    },  (err, result) =>{
		    	if (err) {
		    		res.send({isError: true, msg: "Internal server error", response: 500, data: null});
		    	} else {	
					//console.log(" /initEdit/:tid result = " + JSON.stringify(result));		
					// let response = responseGenerator.generate(false, "Test Details", 200, result);
					// console.log(" edit.controller /initEdit/ result = " + JSON.stringify(result));
		    		res.send({isError: false, msg: "Questions fetched", response: 200, data: result});
		    	}
			});
			
        });
        
	// api to store test attempted 	by users 
	//editRouter.
    editRouter.put('/edit/question/:qid/:data',  (req, res) =>{
		// req.
		console.log(" /edit/question req params = " + req.params);
		console.log(" /edit/question string req.params = " + JSON.stringify(req.params));

	
		var data={
			qid:req.id,
		 	score:req.question
		}
		
		
		return;
		
		questionModel.findOneAndUpdate({
			'id': req.params.qid
		}, {
			'$push': {
				testAttemptedBy: data
			}
		}, (err)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Error Ocurred, error : " + err, 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Successfully Updated The Test", 200, null);
				res.send(response);
			}
		});
    });
    
    //app.use('/user',auth.verifyToken,testRouter);		
	app.use('/api',editRouter);	
}
