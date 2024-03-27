const mongoose = require("mongoose")
const express = require("express")
const app = express()
const colors = require("colors")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const PORT = process.env.PORT || 2000
const hbs = require('hbs')
const bodyParser = require('body-parser')   
const userRoute = require('../Routes/userRoute')
const path = require('path')
const view_path = path.join(__dirname,"../templates/views")
const db_connection_path = "../databases/connection.js"
require(db_connection_path) 
const user_info_collection_path = "../databases/models/user_details.js"

const UserInfoCollection = require(user_info_collection_path)
const cookieParser = require('cookie-parser')
const auth = require("../MiddleWare/auth")
const authTellLoggedIn = require("../MiddleWare/authTellLoggedIn")
app.use(cookieParser()) // cookieParser is used as a middle ware! 
app.use(userRoute)  
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());
const session = require('express-session');
app.use(bodyParser.urlencoded({ extended: true }));
hbs.registerPartials(path.join(__dirname,"../templates/partials"))
app.use(session({
    secret: 'your-secret-key', // Change this to a random string
    resave: false,
    saveUninitialized: true
  }));
app.set('view-engine', 'hbs') 
app.set('views', view_path)




app.listen(PORT ,()=>{
    console.log(`listening at port no: ${PORT}`)
})

