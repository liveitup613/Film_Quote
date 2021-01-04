const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
let port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));   
app.use('/cover', express.static('app/covers'));  

app.get('/', (req, res) => {
    res.send({ data: 'body' });
});

app.use('/quotes', require('./app/controllers/quote'));

app.listen(port, '0.0.0.0', () => {
    console.log('The server is listening...');
});