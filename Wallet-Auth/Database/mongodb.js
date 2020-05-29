const mongoose = require('mongoose')

mongoose.connect('mongodb://auth-database/',{useNewUrlParser:true,useUnifiedTopology:true},).then(()=>{
    // console.log("suc")
})
.catch(()=>{
    console.log("Fail")
})

module.exports = mongoose
