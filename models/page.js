const mongoose = require('mongoose')

const pageSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    entry_point: {
        type: String,
        required: true
    },
    role_id: {
        type: String,
        required: true
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

module.exports = mongoose.model('Page', pageSchema)