const mongoose = require('mongoose')
const User = require('./user')

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    create_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    update_at: {
        type: Date,
        required: true,
        default: Date.now
    }
})

roleSchema.pre('remove', function(next){
    User.find({ role_id : this.id }, (err, users) => {
        if(err) return next(err)
        if(users.length > 0) return next(new Error("Role has User"))
        next()
    })
})

module.exports = mongoose.model('Role', roleSchema)