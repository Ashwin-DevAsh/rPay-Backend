module.exports = {
  host: process.env.POSTGRES_URL,
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
};
