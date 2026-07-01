const knex = require('knex');
const config = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';

let connection;
if (environment === 'test') {
  connection = knex({
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  });
} else {
  connection = knex(config[environment] || config.development);
}

module.exports = connection;
