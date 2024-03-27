const mongoose  = require('mongoose') 
const AllBlogCollectionSchema = new mongoose.Schema({
    uid : String,
    fname : String,
    lname : String,
    email : String,
    password : String,
    placename : String,
    city : String,
    state : String ,
    image : String,
    desc : String,
    shortdesc : String,
    likes : Number,
    isPending : Boolean
})

const AllBlogCollection = new mongoose.model('Allblog' , AllBlogCollectionSchema)
module.exports = AllBlogCollection 