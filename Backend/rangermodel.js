const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/mongoprac')
const rangerSchema = mongoose.Schema({
    name:String,
    color:String,
    phone:String,
    expiry:String
})
module.exports = mongoose.model("ranger",rangerSchema);
