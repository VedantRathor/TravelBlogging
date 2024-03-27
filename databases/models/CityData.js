const mongoose = require('mongoose') 
const citySchema = new mongoose.Schema({
    cityimage : String,
    citytitle : String,
    citydesc : String
})

const CityDataCollection = new mongoose.model('Citydata' , citySchema)
module.exports = CityDataCollection