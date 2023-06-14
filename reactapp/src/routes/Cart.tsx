import { useEffect, useState } from "react";
import { CartProduct } from "../models/Order";
import $ from 'jquery';
import CartItem from "../components/CartItem";
import '../styles/Cart.css';
import { useNavigate } from "react-router-dom";
import { setProfile, useAppDispatch } from "../store";
import LoadingComponent from "../components/LoadingComponent";
import ErrorComponent from "../components/ErrorComponent";

export default function Cart() {
    const navigate = useNavigate();
    const dispatcher = useAppDispatch();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [first, setFirst] = useState(true);
    const [items, setItems] = useState<CartProduct[]>([]);

    const getCart = () => {
        setLoading(true);
        $.ajax('/api/collection/cart', {
            success: result => {
                setItems(result);
                setLoading(false);
                setFirst(false);
            },
            error: () => {
                setError(true);
            }
        })
    };
    useEffect(() => {
        document.title = 'Корзина - Sterling';
    }, []);

    const setCount = (id: number, count: number) => {
        setLoading(true);
        $.ajax('/api/collection/cart/', {
            method: 'POST',
            processData: false,
            contentType: 'application/json',
            data: JSON.stringify({
                id, count
            }),
            success: () => {
                getCart();
                setLoading(false);
                setFirst(false);
            },
            error: () => {
                setError(true);
                setLoading(false);
                setFirst(false);
            }
        });
        if (count == 0) replaceProfile();
    };

    const order = () => {
        $.ajax('/api/collection/makeOrder', {
            success: () => {
                replaceProfile();
                navigate('/orders');
            },
            error: () => {

            }
        })
    };

    const replaceProfile = () => {
        $.ajax('/api/user/getMe', {
            success: result => {
                dispatcher(setProfile(result));
            }
        });
    };

    useEffect(() => {
        getCart();
    }, []);

    return (
        <div>
            {loading && first && <LoadingComponent />}
            {error && <ErrorComponent />}
            {!loading && !first && <div id='cart-panel'>
                <div className="btn btn-outline-success" onClick={order}>Оформить заказ</div>
            </div>}
            <div>
                {items.map(t => <CartItem key={`cart-${t.id}`} item={t} setCount={count => setCount(t.id, count)} loading={loading} />)}
            </div>
        </div>
    );
}