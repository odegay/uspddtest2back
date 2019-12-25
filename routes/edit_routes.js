const mongoose = require('mongoose');
const express = require('express');
const editRouter = new express.Router();
const questionModel = mongoose.model('Question');
// *********** ALL API'S ********************//

editRouter.use(function(req, res, next) {
  console.log('%s %s %s', req.method, req.url, req.path);
  next();
});

// API to init Edit form should be refactored to implement more generic APIs
editRouter.get('/initEdit', function(req, res) {
  questionModel.find({}, (err, result) =>{
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
        msg: 'Questions fetched',
        response: 200,
        data: result,
      };
      res.send(stub);
    }
  });
});

// API to save edited question
editRouter.put('/question/:qid', function(req, res) {
  // req.
//  console.log(' PUT /edit/question req body = ' + JSON.stringify(req.body));
  const data={
    qid: req.body.id,
    question: req.body.question,
  };
  // FIX REFACTORING NEEDED
  questionModel.findOneAndUpdate({
    'id': data.qid}, {
    'question': data.question.question,
    'rightanswer': data.question.rightanswer,
    'answers': data.question.answers,
  }, {'upsert': true}, (err, doc)=> {
    if (err) {
      // true, 'Some Error Ocurred, error : ' + err, 500, null);
      // console.log(' /edit/question savign error ' + JSON.stringify(err));
      const stub = {
        isError: true,
        msg: 'Internal server error',
        response: 500,
        data: null,
      };
      res.send(stub);
    } else {
      // false, 'Successfully Updated The Test', 200, null);
      // console.log(' /edit/question saving OK');
      // console.log(' /edit/question doc = ' + JSON.stringify(doc));
      const stub = {
        isError: false,
        msg: 'Save completed',
        response: 200,
        data: null,
      };
      res.send(stub);
    }
  });
});

editRouter.delete('/question/:qid', function(req, res) {
// eslint-disable-next-line max-len
// console.log(' DELETE /edit/question req body = ' + JSON.stringify(req.params.qid));
  questionModel.findOneAndDelete({
    'id': req.params.qid}, (err)=> {
    if (err) {
      const stub = {
        isError: true,
        msg: 'Internal server error',
        response: 500,
        data: null,
      };
      // console.log(' DELETE /edit/question stub = ' + JSON.stringify(stub));
      res.send(stub);
    } else {
      const stub = {
        isError: false,
        msg: 'Delete completed',
        response: 200,
        data: null,
      };
      // console.log(' DELETE /edit/question stub = ' + JSON.stringify(stub));
      res.send(stub);
    }
  });
});

module.exports = editRouter;
