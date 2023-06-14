import React, { useState } from 'react';
import { Link, Form } from "react-router-dom";
import '../styles/components/SearchInput.css';

export default function SearchInput() {
    const [query, setQuery] = useState('');
    return (
        <div id='search-input-container'>
            <Form id='search-form' method='get' action='/search'>
                <input
                    type='text'
                    name='query'
                    className='form-control'
                    placeholder='Поиск'
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    required
                />
                <Link id='search-button' to={`/search?query=${encodeURIComponent(query)}`} hidden={!query}>
                    <i className='bx bx-search bx-sm'></i>
                </Link>
            </Form>
        </div>
    );
}