const saveInsession = (req, res, next) => {
    try {
      
            req.session.returnTo = req.originalUrl;
            const retTO = req.originalUrl
            console.log(`session is : ${retTO}`.bgRed)
        
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = saveInsession