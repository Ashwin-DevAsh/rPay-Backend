const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost',{useNewUrlParser:true,useUnifiedTopology:true},).then(()=>{
    console.log("suc")
})
.catch(()=>{
    console.log("Fail")
})

module.exports = mongoose
