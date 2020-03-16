import React , {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// Note from Bootstrap website: Put any other imports below so that CSS from your
// components takes precedence over default styles.
import {Card, Container, Row, Col, Button} from 'react-bootstrap';
import './App.css';
import Book from './Components/Book/Book';
import backgroundImg from "./kourosh-qaffari-RrhhzitYizg-unsplash.jpg"; //Photo by Kourosh Qaffari on Unsplash

class App extends Component{
  constructor(){
    super();
    this.state = {
      books: [], //books returned from Google API search
      inputValue: '', //what user is typing into input field
      cart: [], //books that are in user's shopping cart
      viewingCart: false, //whether the user is viewing books in their cart
      noResultsFound: false, //whether or not user's search term returns any results
      landingPage: true, //whether the user is on the landing page
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
    this.setState({landingPage: false}); //do not display background image
  }

  handleChange = (event) => {
    event.preventDefault();   
    this.setState({inputValue: event.target.value});
  }

  handleCart = (event) => { //user clicks view cart button
    fetch('/getbooks', {mode: 'no-cors'})
    .then((res) => res.json())
    .then((cart) => this.setState({cart: cart}))
    .then(() => this.setState({viewingCart: true}))
    .catch(err => {
      console.log(err);
    }); 
    this.setState({landingPage: false}); //do not display background image
  }

  handleReturnSearch = (event) => {
    this.setState({viewingCart: false})
    if(this.state.inputValue == ''){ //if user has not yet searched for a title
      this.setState({landingPage: true}); //do not display background image
    }
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
    return cartTotal.toFixed(2); //Round total up to nearest 2 decimal places.
  }

  handleLandingPage = (event) => {
    this.setState({landingPage: true});
  }

  render(){
    const viewingCart = this.state.viewingCart;
    let userDisplay;
    let inlineStyle = {display: 'inline'};
    let buttonStyle = {backgroundColor: '#000000', color:'#FFF', borderColor:'#000000'};
    let backgroundStyle = {backgroundImage: "url(" + backgroundImg + ")", backgroundRepeat: 'no-repeat', 
                          width: '100%', height: '100%', position: 'absolute', backgroundSize: 'cover', 
                          backgroundPosition: '50% 50%', zIndex: '0'};
    let landingPageTextStyle = {color: 'white'};
    let landingPageDivStyle = {paddingTop: '250px', justifyContent: 'center', textAlign: 'center'};
    let landingButtonStyle = {backgroundColor: '#FFF', color:'#000000', borderColor:'#FFF'}
    let searchInputStyle = {display: 'inline', width: '400px', outline: 'none'};
    let photoCreditStyle = {color: '#ebebeb'}
    const noResultsFound = this.state.noResultsFound;
    let searchResults;

    if(!viewingCart){ //if the user is not viewing their cart
      userDisplay = 
      <div>
      <span class="d-flex justify-content-between mb-3 mt-2">
          <Button onClick={this.handleLandingPage} style={landingButtonStyle} className="button"><strong>ADVENTURE BOOKSTORE</strong></Button>
          <form onSubmit={this.handleSubmit} style={inlineStyle} className="active-orange-2">
            <input type='text' value={this.state.value} onChange={this.handleChange} placeholder="SEARCH BOOK TITLE" style={searchInputStyle} className="form-control border-left-0 border-right-0 border-top-0"></input>
            <i class="fas fa-search"></i>
          </form>
          <Button onClick={this.handleCart} style={landingButtonStyle} className="button">MY SHOPPING CART</Button>
      </span>
      </div>
    } else { //if the user is viewing their cart
      userDisplay = 
      <div>
        <Button onClick={this.handleReturnSearch} style={landingButtonStyle} className="button"><strong>RETURN TO SEARCH</strong></Button>
        <h3 style={{textAlign: 'center'}}>MY SHOPPING CART</h3>
        <Container>
          <Row>
          {this.state.cart.map((book) => //book parameter is a book entity from the database
            <Col xs={3} className="mb-5 d-flex flex-column col-6 col-md-4 col-lg-3" key={book.BookNo}>
            <Book style={inlineStyle} key={book.BookNo} bookTitle={book.BookTitle} bookAuthors={[book.BookAuthor]} bookPrice={book.BookPrice} bookImage={book.BookImageURL}/>
            <Button onClick={() => this.handleRemoveFromCart(book)} style={buttonStyle} className="button">Remove From Cart</Button>
            </Col>
          )}
          </Row>
        </Container>
        <span class="d-flex justify-content-center">
          <h3><strong>SUBTOTAL: $ {this.calculateCartTotal(this.state.cart)} USD</strong></h3>
        </span>
        <span class="d-flex justify-content-center mb-5 mt-2">
          <Button style={buttonStyle} className="button">Proceed To Checkout</Button>
        </span>
      </div>
    }

    if(noResultsFound && !viewingCart && !this.state.landingPage){
      //if user search has no Google Books API results and not viewing cart and not on landing page
      searchResults = <span>No Results Found</span>
    } else if (!noResultsFound && !viewingCart && this.state.landingPage) {
      //if user has not searched any title yet (still on landing page)
      searchResults = 
      <div style={landingPageDivStyle}>
      <h1 style={landingPageTextStyle}>Find your next reading adventure.</h1>
      <h4 style={photoCreditStyle}>Photo by Kourosh Qaffari on Unsplash</h4>
      </div>
    } else if (!noResultsFound && !viewingCart){ //if results were found from Google Books API
      searchResults = 
      <div>
      <Container>
      <Row>
      {this.state.books.map(book => //book parameter is a JSON object from Google Books API
        <Col xs={3} className="mb-5 d-flex flex-column col-6 col-md-4 col-lg-3" key={book.id}>
        <Book style={inlineStyle} bookTitle={book.volumeInfo.title} bookAuthors={this.findBookAuthor(book)} bookPrice={this.findBookPrice(book)} bookImage={this.findBookImage(book)}/>
        <Button onClick={() => this.handleAddToCart(book)} style={buttonStyle} className="button">Add To Cart</Button>
        </Col>
      )}
      </Row>
      </Container>
    </div>
    } 

    //Only display the background image if the user is on landing page and has not yet searched a title.
    if(!this.state.landingPage && !this.state.noResultsFound){ 
      backgroundStyle = {};
    }
    if(!this.state.landingPage && this.state.noResultsFound){
      backgroundStyle = {};
    }

    return(
      <div>
        {userDisplay}
        <div style={backgroundStyle}>
          {searchResults}
        </div>
      </div>
    )
  }
}

export default App;
