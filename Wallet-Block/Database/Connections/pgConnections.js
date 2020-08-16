const { Client } = require("pg");

class Connection {
  static client;
  static getClient() {
    if (client == null) {
      console.log("New Connection");
      client = connect();
    } else {
      return client;
    }
  }

  connect() {
    const client = new Client({
      host: "database",
      port: 5432,
      user: "postgres",
      password: process.env.POSTGRES_PASSWORD,
      database: "Rec_Wallet",
    });

    client.connect((err) => {
      console.log(err);
    });

    return client;
  }
}

module.exports = Connection.getClient();
