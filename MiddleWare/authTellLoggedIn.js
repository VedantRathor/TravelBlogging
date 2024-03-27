const jwt = require('jsonwebtoken')
const UserInfoCollection = require('../databases/models/user_details')

const authTellLoggedIn = async(req,res,next) =>{
    try {
        const token = req.cookies.jwt 
        // attach the trending blog! 
        console.log(token)
         if( token == null ){
             res.locals.user = {
                isloggedIn : false
             }
         }else{
            const verify_user = jwt.verify(token , "mynameisvedantrathore")
            console.log(verify_user) 
            const result = await UserInfoCollection.findOne({_id : verify_user._id}) 
            res.locals.user = {
                isloggedIn : true ,
                result : result
            }
            console.log(`hey : ${result}`.bgYellow)
         }
       
        next()
    } catch (error) {
        res.redirect('/login')
    }
}

module.exports = authTellLoggedIn