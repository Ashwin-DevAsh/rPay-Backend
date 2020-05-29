const {Client} = require('pg')
const client = new Client({
    host: 'status-database',
    port: 5432,
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database:"status"
  })

client.connect(err=>{
    console.log(err)
})

module.exports = client