const express = require('express');
const app = express();
require('dotenv').config();
// const fetch = require('fetch');
const request = require('request');
const mysql = require('mysql');

// Create connection to MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bookstore'
});

// Connect to the MySQL database
db.connect((err) => {
  if(err){
    throw err;
  }
  console.log('Successfully connected to MySQL database');
});

// Create MySQL database
app.get('/createdatabase', (req, res) => {
  let sql = 'CREATE DATABASE bookstore';
  db.query(sql, (err, result) => {
    if(err) throw err;
    // console.log(result);
    res.send('Database created');
  });
});

// Create table in MySQL database
app.get('/createbooktable', (req, res) => {
  let sql = 'CREATE TABLE Book(BookNo INTEGER AUTO_INCREMENT, BookTitle VARCHAR(100), BookAuthor VARCHAR(100), BookPrice VARCHAR(50), BookImageURL VARCHAR(2090), PRIMARY KEY (BookNo))';
  db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
    res.send('Book table created');
  });
});

// Retrieve JSON data on book title from Google Books API
app.get('/searchTitle/:bookTitle', (req, res) => {
    // console.log('req.params.bookTitle is: ' + req.params.bookTitle);
    //full URL example: https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=yourAPIKey
    const baseURL = 'https://www.googleapis.com/books/v1/volumes?q=intitle:';
    //user search term from App.js React component
    const title = req.params.bookTitle;
    //api key
    const apiKey = '&key=' + process.env.API_KEY;
    //restrict number of results returned from request
    const maxResults = '&maxResults=10';
    apiURL = baseURL + title + maxResults + apiKey;

    request(apiURL, function(error, response, body){
        if(error){
          res.send("Something went wrong!");
          res.send(error);
        } else{
          if(response.statusCode == 200){ //if the request worked
            let parsedData = JSON.parse(body);
            // console.log("parsedData.items[0].saleInfo.saleability is " + parsedData.items[0].saleInfo.saleability);
            let books = parsedData.items;
            res.json(books);
          }
        }
      });
});



// Insert book into book table
//bookID is id key in JSON response from Google Books API
app.get('/addbook/:bookTitle/:bookAuthor/:bookPrice', (req, res) => { 
  //add-on to image URL: '&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'
  let imageURLAddOn = '&printsec=' + req.query.printsec + '&img=' + req.query.img + '&zoom=' + req.query.zoom + '&edge=' + req.query.edge + '&source=' + req.query.source;
  let book = {BookTitle: req.params.bookTitle, BookAuthor: req.params.bookAuthor, BookPrice: req.params.bookPrice, BookImageURL: req.query.q + imageURLAddOn};
  let sql = 'INSERT INTO Book SET ?';
  let query = db.query(sql, book, (err, result) => {
    if(err) throw err;
    // console.log(result);
    res.send('Test book added');
  })
});

// Select all books in book table of database
app.get('/getbooks', (req, res) => {
  let sql = 'SELECT * FROM book';
  let query = db.query(sql, (err, result) => {
    if(err) throw err;
    // console.log(result);
    res.send(result);
  });
});

// Delete book from book table
app.get('/deletebook/:BookNo', (req, res) => {
  
  let sql1 = 'DELETE FROM book WHERE BookNo = ' + req.params.BookNo;
  let query1 = db.query(sql1, (err, result) => {
    if(err) throw err;
    // console.log(result);
    // res.send('Book deleted');
  });

  let sql2 = 'SELECT * FROM book';
  let query2 = db.query(sql2, (err, result) => {
  if(err) throw err;
  res.send(result); //Send back books after book has been deleted.
  })

});

const port = 5000;

app.listen(port, () => console.log('Server started on port ' + port));