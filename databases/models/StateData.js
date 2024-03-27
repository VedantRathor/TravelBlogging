const mongoose = require('mongoose') 
// defining the schema ! 
const stateSchema = new mongoose.Schema({
    statename : String,
    stateimage : String, 
    statedesc : String
})

const StateData = new mongoose.model('Statedata', stateSchema )

module.exports = StateData