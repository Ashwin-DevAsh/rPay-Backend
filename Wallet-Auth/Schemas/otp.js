const mongoose = require('../Database/mongodb')
var Schema = mongoose.Schema

var otpSchema = new Schema({
    number:String,
    otp:Number,
    verified:Boolean
})

module.exports = mongoose.model('otp',otpSchema)