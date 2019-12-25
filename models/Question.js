// Including Mongoose model...
const mongoose = require('mongoose');
const Answer = require('./Answer.js');
const AnswerSchema = mongoose.model('Answer').schema;

// creating object
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  id: {type: String, require: true},
  question: {type: String, require: true},
  rightanswer: {type: Number, require: true},
  answers: [AnswerSchema],
});
module.exports = mongoose.model('Question', QuestionSchema);
