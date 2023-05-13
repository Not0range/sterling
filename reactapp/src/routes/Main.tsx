import { useEffect, useState } from "react";
import { Category, Product } from "../models/Product";
import $ from 'jquery';
import ProductItem from "../components/ProductItem";
import '../styles/Main.css';
import CategoryItem from "../components/CategoryItem";

export default function Main() {
    const [page, setPage] = useState(0);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [end, setEnd] = useState(false);
    const [error, setError] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Product[]>([]);

    const getProducts = () => {
        $.ajax(`/api/product/${page + 1}`, {
            success: (result) => {
                if (result.length == 0)
                    setEnd(true);
                else
                    setItems([...items, ...result]);
                setLoadingProduct(false);
                setPage(page + 1);
            },
            error: () => {
                setLoadingProduct(false);
                setError(true);
            }
        });
    }

    const checkEdge = () => {
        if (window.innerHeight + Math.ceil(window.scrollY) >= document.body.offsetHeight - 50 &&
            !loadingProduct && !end) {
            getProducts();
            setLoadingProduct(true);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', checkEdge);
        return () => window.removeEventListener('scroll', checkEdge);
    }, []);

    useEffect(() => {
        $.ajax(`/api/category`, {
            success: (result) => {
                setCategories(result);
                setLoadingCategory(false);
            },
            error: () => {
                setLoadingCategory(false);
                setError(true);
            }
        });
        getProducts();
    }, []);

    return (
        <div>
            {loadingProduct && <p>Loading...</p>}
            {error && !page && <p>Error!</p>}
            {!loadingProduct && !error &&
                <div id='category-container'>
                    {categories.map(t => <CategoryItem category={t} key={`cat${t.id}`} />)}
                </div>}
            {!loadingProduct && !error &&
                <div id='main-container'>
                    {items.map(t => <ProductItem product={t} key={`prod${t.id}`} />)}
                </div>}
        </div>
    );
}