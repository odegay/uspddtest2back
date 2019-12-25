/* eslint-disable require-jsdoc */

// Including Mongoose model...
const mongoose = require('mongoose');
const TranslationModel = mongoose.model('Translation');
const {TranslationServiceClient} = require('@google-cloud/translate');
const projectId = 'samp-170518';
const location = 'global';
const sepStr = '<B>';
//const text = '<>Today I was going fishing<>But unfortunately the weather turned bad<>And I decided to drink some beer<>';


require('./models/Question');
require('./models/Translation');

// Instantiates Translation client
const translationClient = new TranslationServiceClient();
async function translateText(sourceStringsArray) {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: sourceStringsArray,
    mimeType: 'text/plain', // mime types: text/plain, text/html
    sourceLanguageCode: 'en',
    targetLanguageCode: 'ru',
  };
  // Run request
  const [response] = await translationClient.translateText(request);
  // const response = {id = 'sdsds', qId = 'ssssssss'};
  return response;
}

function buildSourceString(translateData) {
  const sourceStringsArray = [translateData.questionResult.question];
  translateData.questionResult.answers.forEach((el) => sourceStringsArray.push(translateData.questionResult.question + ' ' + sepStr + ' ' + el.answer));
  // translateData.questionResult.question + sepStr + ' ';
  // let sourceString = translateData.questionResult.question + sepStr + ' ';
  // translateData.questionResult.answers.forEach((el) => sourceString += el.answer + sepStr + ' ');
  return sourceStringsArray;
}


function translationWrapper(newTranslation, translateData, callback) {
  console.log('getTranslation called translateData = ' + JSON.stringify(translateData));
  console.log('getTranslation called newTranslation = ' + JSON.stringify(newTranslation));
  // const response = translateText();
  // DEBUG here I should paste Google translate call results
  const trans = new TranslationModel();
  // temporary solution
  trans.id = translateData.questionResult.id;
  // temporary solution
  trans.updatedate = Date();
  trans.qId = translateData.questionResult.id;
  trans.originalquestion = translateData.questionResult.question;
  trans.originalanswers = [];
  translateData.questionResult.answers.forEach((el) => trans.originalanswers.push({'id': el.id, 'originalanswer': el.answer}));
  translateData.questionResult.answers;
  trans.languages = [];

  const langentity = {
    langid: translateData.langid,
    langquestion: '', // trans.langid + ': ' + trans.originalquestion,
    langanswers: [],
  };
  // removing spaces in the translated string
  // STOP HERE !!!!
  // tmpSplit = [];
  newTranslation.forEach((el, index) => {
    // fix Google translate joke
    if (el.translatedText.indexOf(sepStr) === -1) {
      console.log('-----------------START---------------------------');
      console.log('DEBUG translatedText = ' + JSON.stringify(el.translatedText));
      let pos = 0;
      let isSeparatorFound = false;
      while (!isSeparatorFound) {
        const foundPos1 = el.translatedText.indexOf(sepStr[0], pos);
        console.log('DEBUG foundPos1 = ' + foundPos1);
        if (foundPos1 === -1) break;
        const foundPos2 = el.translatedText.indexOf(sepStr[1], foundPos1);
        console.log('DEBUG foundPos2 = ' + foundPos2);
        if (foundPos2 === -1) break;
        const foundPos3 = el.translatedText.indexOf(sepStr[2], foundPos1);
        console.log('DEBUG foundPos3 = ' + foundPos3);
        if (foundPos3 === -1) break;
        const matchingStr = el.translatedText.substring(foundPos1, foundPos3+1);
        console.log('DEBUG matchingStr = ' + matchingStr);
        if (matchingStr.replace(/\s/g, '') === sepStr) {
          el.translatedText = el.translatedText.replace(matchingStr, sepStr);
          console.log('DEBUG a el.translatedText = ' + el.translatedText);
          isSeparatorFound = true;
        } else {
          pos = foundPos1 + 1;
        }
        console.log('--------------------FINISH------------------------');
      }
    }
    // removing excessive question from answers and finalizing question/answer translation result
    const tmpSplit = el.translatedText.split(sepStr);
    if (index === 0) {
      langentity.langquestion = tmpSplit[0].trim();
    } else {
      langentity.langanswers.push({id: index, langanswer: tmpSplit[1].trim()});
    }
  });

  trans.languages.push(langentity);
  console.log('---------------------------------------------------');
  console.log('DEBUG getTranslation newobject = ' + JSON.stringify(trans));
  console.log('---------------------------------------------------');

  // if we don't have a translation result previously saved
  if ((translateData.translationResult === null) || (translateData.translationResult === undefined)) {
    trans.save((err) => {
      if (err) {
        const stub = {
          isError: true,
          msg: 'Internal server error - new translation save',
          response: 500,
          data: null,
        };
        callback(stub, null);
      } else {
        callback(null, langentity);
      }
    });
  } else {
    // if we have a translation result
    TranslationModel.findOne({qId: trans.qId}, (err, doc) => {
      if (err) {
        const stub = {
          isError: true,
          msg: 'Internal server error - new translation save',
          response: 500,
          data: null,
        };
        callback(stub, null);
      } else {
        console.log('DEBUG getTranslation existing translation = ' + JSON.stringify(doc));
        doc.originalquestion = trans.originalquestion;
        doc.originalanswers = trans.originalanswers;
        doc.languages.forEach((el) => {
          if (el.langid === langentity.langid) {
            el = langentity;
          } else {
            doc.languages.push(langentity);
          }
        });
        doc.save((err) => {
          if (err) {
            const stub = {
              isError: true,
              msg: 'Internal server error - new translation save',
              response: 500,
              data: null,
            };
            callback(stub, null);
          } else {
            callback(null, langentity);
          }
        });
      }
    });
  }
}

module.exports = {
  getTranslation: function(translateData, callback) {
    const sourceStringsArray = buildSourceString(translateData);
    console.log('---------------------------------------------------');
    console.log('buildSourceString sourceString = ' + JSON.stringify(sourceStringsArray));
    console.log('---------------------------------------------------');
    translateText(sourceStringsArray).then((value) => {
      console.log('getTranslation called value = ' + JSON.stringify(value));
      for (const translation of value.translations) {
        console.log('Translation: ' + translation.translatedText);
      }
      const newTranslation = value.translations;
      translationWrapper(newTranslation, translateData, callback);
    });
  },
};