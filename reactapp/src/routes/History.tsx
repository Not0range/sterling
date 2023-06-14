import { useEffect, useState } from "react";
import { Product } from "../models/Product";
import $ from 'jquery';
import ProductItem from "../components/ProductItem";
import '../styles/History.css';
import LoadingComponent from "../components/LoadingComponent";
import ErrorComponent from "../components/ErrorComponent";

export default function History() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [items, setItems] = useState<Product[]>([]);

    const getProducts = () => {
        $.ajax(`/api/collection/history`, {
            success: (result) => {
                setItems(result);
                setLoading(false);
            },
            error: () => {
                setError(true);
                setLoading(false);
            }
        });
    }
    useEffect(() => {
        document.title = 'История - Sterling';
    }, []);

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <div>
            {loading && !error && <LoadingComponent />}
            {error && <ErrorComponent />}
            {!loading && !error &&
                <div id='main-container'>
                    {items.map(t => <ProductItem product={t} key={`prod${t.id}`} />)}
                </div>}
        </div>
    );
}