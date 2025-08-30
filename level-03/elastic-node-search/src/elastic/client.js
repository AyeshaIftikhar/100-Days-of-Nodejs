// src/elastic/client.js
const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');
dotenv.config();

const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const username = process.env.ELASTICSEARCH_USERNAME;
const password = process.env.ELASTICSEARCH_PASSWORD;

const clientOptions = { node };

if (username && password) {
  clientOptions.auth = { username, password };
}

const client = new Client(clientOptions);

module.exports = client;
