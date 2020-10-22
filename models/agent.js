const mongoose = require('mongoose')
const Contract = require('./contract')
const agentSchema = mongoose.Schema({
    sales_code: {
        type: String,
        required: true
    },
    name: {
        type: String,
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

agentSchema.pre('remove', function(next) {
    Contract.find({ agent_id: this.id }, (err, contracts) => {
        if(err) next(err)
        if(contracts.length > 0) next(new Error("Agent Has a Contract"))
        next()
    })
})
module.exports = mongoose.model('Agent', agentSchema);