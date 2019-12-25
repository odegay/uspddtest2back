// Translation model for mongoose

const mongoose = require('mongoose');
// const Translation = require('./Translation.js');
// const TranslationSchema = mongoose.model('Translation').schema;
// creating object

const Schema = mongoose.Schema;

const TranslationSchema = new Schema({
  id: {type: String, require: true},
  updatedate: {type: String, require: true},
  qId: {type: String, require: true},
  originalquestion: {type: String, require: true},
  originalanswers: [
    {
      id: {type: String, require: true},
      originalanswer: {type: String, require: true},
    },
  ],
  languages: [
    {
      langid: {type: String, require: true},
      id: {type: String, require: true},
      langquestion: {type: String, require: true},
      langanswers: [
        {
          id: {type: String, require: true},
          langanswer: {type: String, require: true},
        },
      ],
    },
  ],
});

module.exports = mongoose.model('Translation', TranslationSchema);
