'use strict';
/* eslint-disable max-len */
const mongoose = require('mongoose');
const express = require('express');
const testRouter = new express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const events = require('events');
// const nodemailer = require('nodemailer');
// const passport = require('passport');

// const userRouter  = express.Router();

// const userModel = mongoose.model('User');
// const socialModel = mongoose.model('SocialUser');
const testModel = mongoose.model('Test');
const questionModel = mongoose.model('Question');
const translationModel = mongoose.model('Translation');
// const performanceModel = mongoose.model('Performance');

// libraries and middlewares
// const config = require('./../../config/config.js');
// const responseGenerator = require('./../../libs/responseGenerator');
// const auth = require("./../../middlewares/auth");
// const random = require("randomstring");
const uuidv1 = require('uuid/v1');
const transService = require('../translationservices');

// *********** ALL API'S ********************//

// API to get a complete details of test
testRouter.get('/testinit/:tid', function(req, res) {
  testModel.findOne({
    'id': req.params.tid,
  }, (err, result) =>{
    if (err) {
      const stub = {
        isError: true,
        msg: 'Internal server error',
        response: 500,
        data: null,
      };
      res.send(stub);
    } else {
      const sessionUUID = uuidv1();
      const stub = {
        isError: false,
        msg: 'Test initiated',
        response: 200,
        data: {uid: sessionUUID, result: result},
      };
      res.send(stub);
    }
  });
});

testRouter.get('/checkAnswer/:qid/:answId', function(req, res) {
  questionModel.findOne({
    'id': req.params.qid,
  }, (err, result) =>{
    if (err) {
      const stub = {
        isError: true,
        msg: 'Internal server error',
        response: 500,
        data: null,
      };
      res.send(stub);
    } else {
      const stub = {
        isError: false,
        msg: 'Answer checked',
        response: 200,
        data: result,
      };
      res.send(stub);
    }
  });
});

testRouter.get('/questions', (req, res)=> {
});

testRouter.get('/questions/:qid', (req, res)=> {
});

// to get next question REFACTORING!!!!
// I don't like tis req.params.data dependency in the first callback.
// I don't trust it
testRouter.get('/getNextQuestion/:tid/:data', (req, res)=> {
// transforming string data to array
  req.params.data = JSON.parse(req.params.data);
  // getting test data.
  // We need which questions are linked to this particular test. REFACTORING
  testModel.findOne({
    'id': req.params.tid,
  }, (err, test)=> {
    if (err) {
      const stub = {
        isError: true,
        msg: 'Internal server error',
        response: 500,
        data: null,
      };
      res.send(stub);
    } else if (test === null || test === undefined || test === []) {
      // No more questions found, however should.
      // REFACTORING: more contorl on requests.
      // This should not happen in a ususal flow
      // const error = 'error';

      res.send({
        isError: false,
        msg: 'No data',
        response: 204,
        data: null});
    } else {
      // Second part of execution.
      // We are looking for one more question.
      // Adding some variables for better understanding
      // questions - array of all questions in the test
      const questions = test.questions;
      // removeQuestions - array of questions
      // already shown to the User (comes from UI)
      const removeQuestions = req.params.data;
      // I do not know how to pass additional parameters to callbacks.
      // REFACTORING: probably might cause issues in concurrent env
      // adding on more attribute to req.params
      // and filtering out answered questions

      let filteredQuestions;
      if (Array.isArray(removeQuestions)) {
        filteredQuestions = questions.filter(
            (el) => !removeQuestions.includes(el),
        );
      } else {
        filteredQuestions = questions;
      }
      // Picking up one random id from the list of unanswered questions
      if (filteredQuestions.length>0) {
        const chosenId = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
        // console.log("test.controller.js getNextQuestion: chosenId: " + chosenId);

        //* *****************callback hell********************** REFACTORING

        // Getting chosen question data
        questionModel.findOne({
          'id': chosenId,
        }, (err, question)=> {
          if (err) {
            // fatal error
            // let error = responseGenerator.generate(true, "We are experiencing some issues please try again later", 500, null);
            res.send({isError: false, msg: 'We are experiencing some issues please try again later', response: 500, data: null});
          } else if (test === null || test === undefined || test === []) {
            // No more questions found, however should
            // const error = {isError: false, msg: 'We are experiencing some issues please try again later', response: 204, data: null};
            // responseGenerator.generate(false, "We are experiencing some issues please try again later", 204, null);
            res.send('error');
          } else {
            // console.log('test.controller.js getNextQuestion: featched question: ' + question);
            const response = {isError: false, msg: 'Question fetched', response: 200, data: question};
            res.send(response);
          }
        });
        //* *****************callback hell**********************
      } else {
        const error = {isError: false, msg: 'No more questions', response: 204, data: null};
        res.send(error);
      }
    }
  });
});

testRouter.get('/translation/:qid/:lang', function(req, res) {
//  console.log('ENTERED TRANSLATION = ' + JSON.stringify(req.params));
  // Looking for a translation cache for requested question
  let isTranlsationNeeded = false;
  const translateData = {};
  const chosenLang = req.params.lang;

  // else if (result === null || result === undefined || result === []) {
  //   // no translation has been found
  //   const error = {isError: false, msg: 'No more questions', response: '204', data: null};
  //   res.send(error);

  questionModel.findOne({
    id: req.params.qid,
  }, (err, questionResult) =>{
    // error handling merging both error and no result here for now is OK. After proper errors processing should be fixed
    if ((err) || (questionResult === null)) {
      const stub = {
        isError: true,
        msg: 'Internal server error - error with question data',
        response: 500,
        data: null,
      };
      res.send(stub);
    } else {
      translationModel.findOne({
        'qId': req.params.qid,
      }, (err, translationResult) =>{
        // error while getting translation
        if (err) {
          const stub = {
            isError: true,
            msg: 'Internal server error - error with translation data',
            response: 500,
            data: null,
          };
          res.send(stub);
        } else {
          // response from Mongo received
          console.log('Translation RESULT = ' + JSON.stringify(translationResult));

          // check if no translation found
          if ((translationResult === null) || (translationResult === undefined)) {
            // we need to get a translation if there is no translations for the question at all
            isTranlsationNeeded = true;
          } else {
            // if translation entity exists
            // we need to check whether translation cache for particular maguage exists
            // trying to find required translation
            let languages = [];
            languages = translationResult.languages.filter((el) => (el.langid == req.params.lang));
            if (languages.length > 0 ) {
              // if translation for required lang found in translation cache

              // building strings to compare everything to caps and without spaces
              // question which has benn loadeded from the master table
              let compareInitialStr = questionResult.question.replace(/\s/g, '').toUpperCase();
              questionResult.answers.forEach((el) => compareInitialStr += el.answer.replace(/\s/g, '').toUpperCase());

              // question which has been loaded from the CACHE table
              let compareCacheStr = translationResult.originalquestion.replace(/\s/g, '').toUpperCase();
              translationResult.originalanswers.forEach((el) => compareCacheStr += el.originalanswer.replace(/\s/g, '').toUpperCase());

              // we need to get a translation if cache doesn't match the question in the master table
              if (compareInitialStr !== compareCacheStr) {
                isTranlsationNeeded = true;
              } else {
                const stub = {
                  isError: false,
                  msg: 'Translation cache used',
                  response: 200,
                  //                    data: translationResult.languages[0],
                  data: languages[0],
                };
                res.send(stub);
              }
            } else {
              // we need to get a translation if there is no translations for requested language
              isTranlsationNeeded = true;
            }
          }
          // after all check we should call Google Translate if needed
          if (isTranlsationNeeded) {
            translateData.langid = chosenLang;
            translateData.questionResult = questionResult;
            translateData.translationResult = translationResult;
            transService.getTranslation(translateData, (err, translationResult) => {
              if (err) {
                const stub = {
                  isError: true,
                  msg: 'Internal server error - error with Google Translate data',
                  response: 500,
                  data: null,
                };
                res.send(stub);
              } else {
                const stub = {
                  isError: false,
                  msg: 'Translation completed',
                  response: 200,
                  data: translationResult,
                };
                res.send(stub);
              }
            });
            console.log('HOORRRAAAAYYY = ' + JSON.stringify(translationResult));
          }
        }
      });
    }
  });
});
module.exports = testRouter;
