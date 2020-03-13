import React, {Component} from 'react';

class Book extends Component {
    render() {
        return (
            <div style={this.props.style}>
                <p style={this.props.style}>
                    <strong>Title:</strong> {this.props.bookTitle}, 
                    <strong> Authors: </strong>
                    {this.props.bookAuthors.map(author => 
                        <span> {author} </span>    
                    )}, 
                    <strong>Price: </strong> {this.props.bookPrice}
                </p>
            </div>
        )
    }
}

export default Book;
