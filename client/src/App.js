import React , {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// Note from Bootstrap website: Put any other imports below so that CSS from your
// components takes precedence over default styles.
import {Card, Container, Row, Col, Button} from 'react-bootstrap';
import './App.css';
import Book from './Components/Book/Book';

class App extends Component{
  constructor(){
    super();
    this.state = {
      books: [], //books returned from Google API search
      inputValue: '', //what user is typing into input field
      cart: [], //books that are in user's shopping cart
      viewingCart: false, //whether the user is viewing books in their cart
      noResultsFound: false //whether or not user's search term returns any results
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    // console.log('form was submitted. search term is: ' + this.state.inputValue);
    fetch('/searchTitle/' + this.state.inputValue, {mode: 'no-cors'})
    .then((res) => res.json())
    .then((books) => this.setState({books: books}))
    .then(() => this.setState({noResultsFound: false})) //display search results
    .catch(err => {
      console.log(err);
      this.setState({noResultsFound: true}); //display no results found message
    }); 
  }

  handleChange = (event) => {
    event.preventDefault();   
    this.setState({inputValue: event.target.value});
  }

  handleCart = (event) => {
    fetch('/getbooks', {mode: 'no-cors'})
    .then((res) => res.json())
    .then((cart) => this.setState({cart: cart}))
    .then(() => this.setState({viewingCart: true}))
    .catch(err => {
      console.log(err);
    }); 
  }

  handleReturnSearch = (event) => {
    this.setState({viewingCart: false})
  }

  handleAddToCart = (book) => { //book is a JSON object from Google Books API repsonse
    let bookAuthors = this.findBookAuthor(book); //returns array of strings
    let bookAuthorsString = "";
    let i;
    for(i = 0; i < bookAuthors.length; i++){
      bookAuthorsString += bookAuthors[i];
    }
    fetch('/addbook/' + book.volumeInfo.title + '/' + bookAuthorsString + '/' + this.findBookPrice(book) + '?q=' + book.volumeInfo.imageLinks.thumbnail, {mode: 'no-cors'})
    .then((res) => res.json())
    .then((newCart) => this.setState({cart: newCart}))
    .catch(err => {
      console.log(err);
    }); 
  }

  handleRemoveFromCart = (book) => { //book is a book entity retrieved from database
    fetch('/deletebook/' + book.BookNo, {mode: 'no-cors'}) //delete book from database
    .then((res) => res.json())
    .then((newCart) => this.setState({cart: newCart})) //retrieve books from database and use that information to update the state object
    .catch(err => {
      console.log(err);
    }); 
  }

  findBookPrice(book){  //book is JSON object from Google Books API
    let bookPrice = '';
    if(book.saleInfo.saleability == "NOT_FOR_SALE"){
      bookPrice = "Not For Sale";
    } else if (book.saleInfo.saleability == "FREE"){
      bookPrice = "Free";
    } else { //FOR_SALE or FOR_PREORDER
      bookPrice = book.saleInfo.listPrice.amount;
    }
    return bookPrice;
  }

  findBookAuthor(book){ //book is JSON object from Google Books API
    let bookAuthors = [];
    if(book.volumeInfo.hasOwnProperty('authors')){ //Some books do not have authors.
      bookAuthors = book.volumeInfo.authors;
    } else {
      bookAuthors = ["No Author Listed"];
    }
    return bookAuthors;
  }

  findBookImage(book){ //book is JSON object from Google Books API
    let bookImageURL = '';
    if(book.volumeInfo.hasOwnProperty('imageLinks')){ //Some books do not have images.
      bookImageURL = book.volumeInfo.imageLinks.thumbnail;
    } 
    return bookImageURL;
  }

  calculateCartTotal(cart){
    let cartTotal = 0;
    let i;
    for(i = 0; i < cart.length; i++){
      if(!Number.isNaN(parseFloat(cart[i].BookPrice))){ //if the string parsed is not NaN (not an integer)
        cartTotal += parseFloat(cart[i].BookPrice); //The value is added to the cart total. 
      }
    }
    return cartTotal;
  }

  render(){
    const viewingCart = this.state.viewingCart;
    let userDisplay;
    let style = {display: 'inline'};
    const noResultsFound = this.state.noResultsFound;
    let searchResults;

    if(!viewingCart){ //if the user is not viewing their cart
      userDisplay = 
      <div>
      <h1>This app uses the Google Books API.</h1>
      <button onClick={this.handleCart}>Shopping Cart</button>
      <h2>Search Book by Title</h2>
     
      <form onSubmit={this.handleSubmit} className="mb-5">
        <input type='text' value={this.state.value} onChange={this.handleChange}></input>
        <input type="submit" value="Submit"/>
      </form>
    </div>
    } else { //if the user is viewing their cart
      userDisplay = 
      <div>
        <button onClick={this.handleReturnSearch}>Return to Search</button>
        <h1>Shopping Cart</h1>
        <Container>
          <Row>
          {this.state.cart.map((book) => //book parameter is a book entity from the database
            <Col xs={3} className="mb-5 d-flex flex-column" key={book.BookNo}>
            <Book style={style} key={book.BookNo} bookTitle={book.BookTitle} bookAuthors={[book.BookAuthor]} bookPrice={book.BookPrice} bookImage={book.BookImageURL}/>
            <Button onClick={() => this.handleRemoveFromCart(book)}>Remove From Cart</Button>
            </Col>
          )}
          </Row>
        </Container>
        <div>Cart Total: $ {this.calculateCartTotal(this.state.cart)}</div>
        <button>Proceed To Checkout</button>
      </div>
    }

    if(noResultsFound && !viewingCart){
      searchResults = <span>No Results Found</span>
    } else if (!noResultsFound && !viewingCart){ //if results were found from Google Books API
      searchResults = 
      <div>
      <Container>
      <Row>
      {this.state.books.map(book => //book parameter is a JSON object from Google Books API
        <Col xs={3} className="mb-5 d-flex flex-column" key={book.id}>
        <Book style={style} bookTitle={book.volumeInfo.title} bookAuthors={this.findBookAuthor(book)} bookPrice={this.findBookPrice(book)} bookImage={this.findBookImage(book)}/>
        <Button onClick={() => this.handleAddToCart(book)}>Add To Cart</Button>
        </Col>
      )}
      </Row>
      </Container>
    </div>
    } 

    return(
      <div>
        {userDisplay}
        {searchResults}
      </div>
    )
  }
}

export default App;
