const express = require('express')
const userRoute = new express.Router()
const path = require('path')
const view_path = path.join(__dirname, "../templates/views")
const LoginPage = "C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/login.hbs"

const user_info_collection_path = "C:/Users/vedant.rathore/Desktop/TravellingBlog-main/databases/models/user_details.js"
const UserInfoCollection = require(user_info_collection_path)
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const auth = require("../MiddleWare/auth")
const authTellLoggedIn = require('../MiddleWare/authTellLoggedIn')
const saveInsession = require('../MiddleWare/saveInSession')

const StateDataCollection = require('../databases/models/StateData')
const CityDataCollection = require('../databases/models/CityData')
const AllBlogCollection = require('../databases/models/AllBlogs')
const session = require('express-session');
const { getSystemErrorMap } = require('util')
const { ALL } = require('dns')

userRoute.use(session({
    secret: 'your-secret-key', // Change this to a random string
    resave: false,
    saveUninitialized: true
}));

userRoute.use(cookieParser())
userRoute.use(express.urlencoded({ extended: true }))
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));

const home_page = 'C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/home.hbs'

/* renders the login page */
userRoute.all('/login',   async (req, res) => {

    const login_hbs = "C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/login.hbs"
    try {
        if (req.method === 'GET') {
           
            res.status(200).render(login_hbs)
        }

        if (req.method === 'POST') {
            const email = req.body.email
            const password = req.body.password

            const result = await UserInfoCollection.findOne({ email: email })
            console.log(`${result}`.bgYellow)
            if (result == null) {
                res.send('Please Register')
            } else {
                // user to hai 
                const token = await result.generateToken() // focus on result, which is a instance of UserInfoCollection
                console.log(`${token}`.bgBlue)

                res.cookie('jwt', token, {
                    expires: new Date(Date.now() + 300000),
                    httpOnly: true
                })
                res.cookie('fname', "Vedant", {
                    expires: new Date(Date.now() + 300000),
                    httpOnly: true
                })
                const redirectURL = req.session.returnTo || '/';
                delete req.session.returnTo
                res.redirect(redirectURL)
            }
        }



    }

    catch (err) {
        res.send(err)
    }
})

/* deletes the cookie and render the storedURL page*/
userRoute.get('/logout', async (req, res) => {
    res.clearCookie('jwt')
    res.redirect('/')
})

/* register the user -> generate token -> renders storedURL page*/
userRoute.all('/register', async (req, res) => {
    try {
        if (req.method == 'GET') {
            const register_hbs = "C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/register.hbs"
            res.render(register_hbs)
        }

        if (req.method == 'POST') {
            // form se data aaya ! 
            const registration_data = req.body
            const checkUser = await UserInfoCollection.findOne({ email: registration_data.email })
            if (checkUser == null) {
                // register user
                if (registration_data.password === registration_data.cpassword) {
                    // finally register the user and redirect to home!
                    // also generate token , 
                    const doc1 = await new UserInfoCollection({
                        fname: registration_data.fname,
                        lname: registration_data.lname,
                        email: registration_data.email,
                        password: registration_data.password,
                    })

                    const token = await doc1.generateToken()
                    // attaching to the cookie! 
                    res.cookie('jwt', token, {
                        expires: new Date(Date.now() + 300000),
                        httpOnly: true
                    })
                    await doc1.save()
                    // redirect to the home! 
                    const redirectURL = req.session.returnTo || '/';
                     delete req.session.returnTo
                    res.redirect(redirectURL)

                } else {
                    res.send('passwords are not matching')
                }

            } else {
                res.send('already exists')
            }
        }

    } catch (error) {

    }
})

userRoute.get('/',saveInsession ,  authTellLoggedIn, async (req, res) => {
    try {
        //get the trending blog! 
        const trendingBlog = await AllBlogCollection.find().sort({ likes: -1 }).limit(1)
        console.log(`${trendingBlog}`.bgMagenta)

        // getstate data from mongo
        // const obj = req.session.data 
        let msg = "";
        if (req.session.data && req.session.data.msg) {
            msg = req.session.data.msg
            req.session.data = {}
        }

        console.log(msg)

        const result = await StateDataCollection.find()
        const citydata = await CityDataCollection.find()
        console.log(citydata)
        const userdata = res.locals.user
        console.log(userdata)
        res.render(home_page, {
            userdata: res.locals.user,
            statedata: result,
            citydata: citydata,
            trendingBlog: trendingBlog.length > 0 ? trendingBlog[0] : null,
            msg: msg
        })

    } catch (error) {
        res.status(401).send(`${error}`.bgRed)
    }
})

userRoute.all('/addblog',saveInsession, auth, async (req, res) => {
    const addblog_hbs = "C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/addblog.hbs"
    try {
        if (req.method == 'GET') {
            const userdata = res.locals.user
            const pendingData = await AllBlogCollection.findOne({ $and: [{ uid: userdata.result._id }, { isPending: true }] })
            console.log(`Pending Data: ${pendingData}`)
            if (pendingData == null) {
                res.render(addblog_hbs, {
                    userdata: res.locals.user, // for data saving with uid, fname, lname. 
                    isDataPending: false
                })
            } else {
                // delete that pending! 
                await AllBlogCollection.deleteOne({ $and: [{ uid: userdata.result._id }, { isPending: true }] })

                res.render(addblog_hbs, {
                    userdata: res.locals.user, // for data saving with uid, fname, lname. 
                    city: pendingData.city,
                    state: pendingData.state,
                    image: pendingData.image,
                    desc: pendingData.desc,
                    shortdesc: pendingData.shortdesc,
                    placename: pendingData.placename,
                    isDataPending: true
                })
            }

        }



    } catch (error) {
        res.status(401).send(error)
    }
})

userRoute.post('/submitblog', auth, async (req, res) => {
    try {
        //delete the pending blog first 
        const blogdata = req.body

        const userdata = res.locals.user
        const uid = userdata.result._id
        console.log(userdata)
        const doc1 = new AllBlogCollection({
            uid: userdata.result._id,
            fname: userdata.result.fname,
            lname: userdata.result.lname,
            email: userdata.result.email,
            placename: blogdata.title.toLowerCase(),
            city: blogdata.city.toLowerCase(),
            state: blogdata.state.toLowerCase(),
            image: blogdata.image,
            desc: blogdata.desc,
            shortdesc: blogdata.shortdesc,
            likes: 0,
            isPending: false
        })

        const result = await doc1.save()
        req.session.data = {
            msg: "Your Blog has been succesfully Saved."
        }
        res.redirect(`/user/${uid}/allblogs`)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
})

userRoute.get('/user/:uid/allblogs', saveInsession, authTellLoggedIn, async (req, res) => {
    const userAllBlogs_hbs = 'C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/userAllBlogs.hbs'
    try {
        let msg = "";
        if (req.session.data && req.session.data.msg) {
            msg = req.session.data.msg
            req.session.data = {}
        }
        const uid = req.params.uid;
        const all_the_blogs = await AllBlogCollection.find({ uid: uid })
        console.log(all_the_blogs)

        res.render(userAllBlogs_hbs, {
            userdata: res.locals.user,
            allblogdata: all_the_blogs,
            size: all_the_blogs.length,
            msg: msg
        })
    } catch (error) {
        res.status(401).send(error)
        console.log(error)
    }
})

userRoute.post('/discardblog', auth, async (req, res) => {
    try {
        const blogdata = req.body;
        const userdata = res.locals.user
        const doc1 = new AllBlogCollection({
            uid: userdata.result._id,
            fname: userdata.fname,
            lname: userdata.lname,
            email: userdata.email,
            placename: blogdata.title,
            city: blogdata.city,
            state: blogdata.state,
            image: blogdata.image,
            desc: blogdata.desc,
            shortdesc: blogdata.shortdesc,
            isPending: true
        })

        await doc1.save()
        req.session.data = {
            msg: "Your blog is being drafted succesfully."
        }
        res.redirect('/')

    } catch (error) {
        res.status(401).send(error)
        console.log(error)
    }
})

userRoute.get('/blogs/users/AllBlogs',saveInsession ,  authTellLoggedIn, async (req, res) => {
    const showblog_hbs = 'C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/showblogs.hbs'
    try {
        const userdata = res.locals.user
        const allblogdata = await AllBlogCollection.find()
        if (userdata.isloggedIn == false) {

            res.render(showblog_hbs, {
                userdata: userdata,
                allblogdata: allblogdata,
                size: allblogdata.length
            })
        } else {
            res.render(showblog_hbs, {
                userdata: userdata,
                allblogdata: allblogdata,
                size: allblogdata.length
            })
        }

    } catch (error) {
        res.status(401).send(error)
        console.log(`error: ${error}`.bgRed)
    }
})


// single blog display
userRoute.get('/Blogs',saveInsession, authTellLoggedIn, async (req, res) => {
    const singleblog_hbs = 'C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/singleblog.hbs'
    try {
        const userdata = res.locals.user
        const cardID = req.query.cardID
        const blogdata = await AllBlogCollection.findOne({ _id: cardID })
        console.log(blogdata)
        res.render(singleblog_hbs, {
            userdata: userdata,
            // bhejo full data!
            blogdata: blogdata
        })
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
})

userRoute.all('/blogs/query',saveInsession , authTellLoggedIn, async (req, res) => {
    try {
        const blogsearch_hbs = 'C:/Users/vedant.rathore/Desktop/TravellingBlog-main/templates/views/blog_search.hbs'
        const queryname = req.query.by
        const searchTerm = queryname
        const regex = new RegExp(searchTerm, "i");

        const allblogdata = await AllBlogCollection.find({ $or : [ {city : { $regex : regex}} , {placename : { $regex : regex}} , {state : { $regex : regex}} ]})
        console.log(allblogdata)

        if (req.method == 'GET') {
            // from clicking the card
            res.render(blogsearch_hbs,{
                userdata : res.locals.user,
                queryname : queryname,
                allblogdata : allblogdata,
                size : allblogdata.length 

            })
        }

        if (req.method == 'POST') {
            // from searching in a search bar
            res.render(blogsearch_hbs,{
                userdata : res.locals.user,
                queryname : queryname,
                allblogdata : allblogdata,
                size : allblogdata.length 
            })
        }

    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
})






















































module.exports = userRoute