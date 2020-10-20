const jwt = require('jsonwebtoken')

if(process.env.NODE_ENV !== 'production') require('dotenv').config

module.exports = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    if(!authHeader) {
        req.isAuth = false
        return next()
    }
    const token = authHeader.split(' ')[1]
    if(!token || token === ''){
        req.isAuth = false
        return next()
    }
    try{
        await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return new Error("Something Wrong")            
            req.role_id = user.role_id
            req.isAuth = true
        })     
    } catch (err){
        req.isAuth = false
        return next()
    }

    next()
}