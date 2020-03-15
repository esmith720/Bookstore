import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// Put any other imports below so that CSS from your
// components takes precedence over default styles.
import {Card, Container, Row, Col, Button} from 'react-bootstrap';

class Book extends Component {
    render() {
        return (  
        <Card className="h-100">
            <Card.Img variant="top" src={this.props.bookImage}/>
            <Card.Body>
                <div style={this.props.style}>
                    <div><strong>Title:</strong> {this.props.bookTitle}</div> 

                    <div><strong> Authors: </strong>
                    {this.props.bookAuthors.map(author => 
                        <span> {author} </span>    
                    )}</div>  

                    <div><strong>Price: </strong> {this.props.bookPrice}</div> 
                </div> 
            </Card.Body>
        </Card>
        )
    }
}

export default Book;
