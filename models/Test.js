const mongoose = require('mongoose');
     
const Schema  =  mongoose.Schema;


const testSchema = new Schema({

    testid: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    time: {
        type: String
    },
    instructions: {
        type: String
    },
    questions: []   
});

module.exports = mongoose.model('Test', testSchema);