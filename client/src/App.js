import React , {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// Put any other imports below so that CSS from your
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
    .then(() => this.setState({noResultsFound: false}))
    .catch(err => {
      console.log(err);
      this.setState({noResultsFound: true})
    }); 
  }

  handleChange = (event) => {
    event.preventDefault();   
    this.setState({inputValue: event.target.value});
  }

  handleCart = (event) => {
    fetch('/getbooks', {mode: 'no-cors'})
    // .then((res) => res.json())
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

  handleAddToCart = (book) => {
    let bookAuthors = this.findBookAuthor(book); //returns array of strings
    let bookAuthorsString = "";
    let i;
    for(i = 0; i < bookAuthors.length; i++){
      bookAuthorsString += bookAuthors[i];
    }
    fetch('/addbook/' + book.volumeInfo.title + '/' + bookAuthorsString + '/' + this.findBookPrice(book), {mode: 'no-cors'})
    // .then((res) => res.json())
    .catch(err => {
      console.log(err);
    }); 
  }

  handleRemoveFromCart = (book) => {
    fetch('/deletebook/' + book.BookNo, {mode: 'no-cors'})
    .then((res) => res.json())

    //delete
    // let parsedData = JSON.parse(body);

    .then((newCart) => this.setState({cart: newCart}))
    .catch(err => {
      console.log(err);
    }); 
  }

  findBookPrice(book){ 
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

  findBookAuthor(book){
    let bookAuthors = [];
    if(book.volumeInfo.hasOwnProperty('authors')){
      bookAuthors = book.volumeInfo.authors;
    } else {
      bookAuthors = ["No Author Listed"];
    }
    return bookAuthors;
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
      <button onClick={this.handleCart}>My Shopping Cart</button>
      <h2>Search Book by Title</h2>
     
      <form onSubmit={this.handleSubmit}>
        <input type='text' value={this.state.value} onChange={this.handleChange}></input>
        <input type="submit" value="Submit"/>
      </form>
    </div>
    } else { //if the user is viewing their cart
      userDisplay = 
      <div>
        <button onClick={this.handleReturnSearch}>Return to Search</button>
        <h1>Your Shopping Cart:</h1>
        <Container>
          <Row>
          {this.state.cart.map(book => 
            <Col xs={3} className="mb-5 d-flex flex-column" key={book.BookNo}>
            <Book style={style} key={book.BookNo} bookTitle={book.BookTitle} bookAuthors={[book.BookAuthor]} bookPrice={book.BookPrice}/>
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
    } else if (!noResultsFound && !viewingCart){
      searchResults = 
      <div>
      <Container>
      <Row>
      {this.state.books.map(book => 
        <Col xs={3} className="mb-5 d-flex flex-column" key={book.id}>
        <Book style={style} bookTitle={book.volumeInfo.title} bookAuthors={this.findBookAuthor(book)} bookPrice={this.findBookPrice(book)}/>
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
