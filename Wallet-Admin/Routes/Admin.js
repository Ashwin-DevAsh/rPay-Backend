const app = require("express").Router();
const jwt = require('jsonwebtoken')
const Admin = require('../Database/Schema/Admin')
const bcrypt = require('bcrypt')

app.post("/login",(req,res)=>{
    var email = req.body.email
    var password = req.body.password
    console.log(req.body)
    if(email && password){


        Admin.findOne({email}).exec().then((doc)=>{
            if(doc){
                
                let name = doc.name
                let email = doc.email
                let number = doc.number
                let accessTo = doc.accessTo
                let imageURL = doc.imageURL

                bcrypt.compare(password,doc.password,(err,isMatch)=>{

                    if(err){
                        res.send({"message":"error",err})
                        return
                    }
                    if(!isMatch){
                        res.send({"message":"invalid password"})
                        return
                    }

                    jwt.sign({name,email,number,accessTo},process.env.PRIVATE_KEY,{ expiresIn: '1h' },(err,token)=>{
                        if(err){
                            res.send({message:err.getName()})
                        }else{
                            res.send({
                                message:"done",
                                token,
                                name,
                                number,
                                email,
                                imageURL,
                                accessTo
                            })
                        }
             })
                })

            } else {
                res.send({"message":"invalid admin"})
            }
        }).catch((err)=>{
            res.send({message:err})

        })

    }else{
        res.send({
            "message":"missing username or password"
        })
    }
 
})


module.exports=app