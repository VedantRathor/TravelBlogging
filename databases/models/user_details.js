const { text } = require('body-parser')
const mongoose = require('mongoose') 
const jwt = require('jsonwebtoken')
const UserInfoSchema = new mongoose.Schema({
    fname : {
        type : String,
        required : true
    },

    lname : {
        type : String , 
        required : true 
    },

    email : {
        type : String,
        required : true,
        unique: true 
    },

    password : {
        type : String,
        required : true 
    },
    
    tokens : [{
        token : {
            type : String,
            required : true 
        }
    }]
})

UserInfoSchema.methods.generateToken = async function(){
    const token = jwt.sign({_id : this._id} , "mynameisvedantrathore")
    this.tokens = this.tokens.concat({token:token})
    await this.save()
    return token
}

const UserInfoCollection = new mongoose.model('User_info_collection', UserInfoSchema )
module.exports = UserInfoCollection