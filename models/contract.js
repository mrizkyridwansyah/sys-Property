const mongoose = require('mongoose')

const contractSchema = mongoose.Schema({
    contract_number: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true
    },
    agent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    unit_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },
    contract_date: {
        type: Date,
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
        required: true
    },
    update_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    update_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Contract', contractSchema)