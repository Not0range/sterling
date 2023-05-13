import { useEffect, useState } from "react";
import { Product } from "../models/Product";
import $ from 'jquery';
import { useLocation } from "react-router-dom";
import ProductItem from "../components/ProductItem";
import '../styles/Search.css';

export default function Search() {
    const location = useLocation();
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [end, setEnd] = useState(false);
    const [error, setError] = useState(false);
    const [items, setItems] = useState<Product[]>([]);

    const getProducts = () => {
        $.ajax(`/api/product/search/${page + 1}${location.search}`, {
            success: result => {
                if (result.length === 0)
                    setEnd(true);
                else
                    setItems([...items, ...result]);
                setLoading(false);
                setPage(page + 1);
            },
            error: () => {
                setLoading(false);
                setError(true);
            }
        });
    }

    const checkEdge = () => {
        if (window.innerHeight + Math.ceil(window.scrollY) >= document.body.offsetHeight - 50 &&
            !loading && !end) {
            getProducts();
            setLoading(true);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', checkEdge);
        return () => window.removeEventListener('scroll', checkEdge);
    }, []);

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && !page && <p>Error!</p>}
            {!loading && !error &&
                <div id='search-container'>
                    {items.map(t => <ProductItem product={t} key={t.id} />)}
                </div>}
        </div>
    );
}