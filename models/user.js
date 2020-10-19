const mongoose = require('mongoose')
const Agent = require('./agent')
const Customer = require('./customer')
const Contract = require('./contract')

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    },
    password: {
        type: String,
        required: true
    },
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    wrong_password: {
        type: Number,
        default: 0,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true,
        required: true
    },
    access_token: {
        type: String,
        default: null
    },
    refresh_token: {
        type: String,
        default: null
    },
    create_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    update_at: {
        type: Date,
        default: Date.now,
        required: true
    }
})

userSchema.pre('remove', async function(next) {
    const agentCreateByUser = await Agent.find({ create_by: this.id})
    if(agentCreateByUser.length > 0) next(new Error("User has Agent"))
    const customerCreateByUser = await Customer.find({ create_by: this.id})
    if(customerCreateByUser.length > 0) next(new Error("User has Customer"))
    const contractCreateByUser = await Contract.find({ create_by: this.id})
    if(contractCreateByUser.length > 0) next(new Error("User has Contract"))
    next()
})

module.exports = mongoose.model('User', userSchema)