//Answer model for mongoose
const 	mongoose = require('mongoose');
		
//creating object 
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
                    id:     { type: String, require:true},
                    answer: { type: String, require:true }
});

 module.exports = mongoose.model('Answer', AnswerSchema);