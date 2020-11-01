var app = require('express').Router()
const clientDetails = require("../Database/ClientDetails")


var pool = new Pool(clientDetails)


app.post("/getTransactionsBetweenObjects",async (req,res)=>{

    var postgres = await pool.connect()
    await getTransactionsBetweenObjects(postgres,req,res)   
    (await postgres).release()  
})

app.post("/getTransactions",async (req,res)=>{
    var postgres = await pool.connect()
    await getTransactions(postgres,req,res)   
    (await postgres).release()  

})




async function getTransactionsBetweenObjects(postgres,req,res){

}


async function getTransactions(postgres,req,res){

}

module.exports = app