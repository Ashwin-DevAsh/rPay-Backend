var app = require('express').Router()

const clientDetails = require("../Database/ClientDetails")


var pool = new Pool(clientDetails)


app.post("/withdraw",async (req,res)=>{
    var postgres = await pool.connect()
    await withdraw(postgres,req,res)   
    (await postgres).release()  
})



async function withdraw(postgres,req,res){

}

module.exports = app