require('dotenv').config()
const jwt = require('jsonwebtoken')

async function saveData(data) {
    try{
        await data.save()
        return data
    } catch(err) {
        return new Error(err.message)
    }
}

async function deleteData(data) {
    try{
        await data.remove()
        return data
    } catch(err) {
        return new Error(err.message)
    }
}

async function getAllData(Data, search) {
    try {
        return await Data.find(search)
    } catch(err) {
        return new Error(err.message)
    }
}

async function getDataById(Data, id){
    try {
        return await Data.findById(id)
    } catch(err) {
        return new Error(err.message)
    }
}

async function generateAccessToken(data) {
    return await jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20m"})
}


module.exports =  { getAllData, saveData, getDataById, deleteData, generateAccessToken }