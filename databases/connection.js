const mongoose = require('mongoose') 
mongoose.connect('mongodb://localhost:27017/TravelBlogs')
.then(()=>{
    console.log("connected Succesfully to the database".bgGreen)
})
.catch((err)=>{

})