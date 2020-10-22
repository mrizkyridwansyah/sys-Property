const mongoose = require('mongoose')

const unitSchema = mongoose.Schema({    
    unit_number : {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        required: true,
        default: true
    },
    surface_area: {
        type: Number,
        required: true
    },
    building_area: {
        type: Number,
        required: true
    },
    create_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    create_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    update_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    update_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    }
})

module.exports = mongoose.model('Unit', unitSchema);