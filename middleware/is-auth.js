if(process.env.NODE_ENV !== 'production') require('dotenv').config
const jwt = require('jsonwebtoken')
const { getAllData } = require('../routes')
const User = require('../models/user')

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
        await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
            if(err) return new Error("Something Wrong")     
            const users = await getAllData(User, data.email)
            if(users.length === 0) {
                req.isAuth = false
            } else {
                const user = users[0]
                // req.user_id = user.id
                // req.role_id = user.role_id
                req.isAuth = true
            }
        })     
    } catch (err){
        req.isAuth = false
        return next()
    }

    next()
}