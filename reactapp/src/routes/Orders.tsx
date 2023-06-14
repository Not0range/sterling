import { useEffect, useState } from "react";
import { Order } from "../models/Order";
import $ from 'jquery';
import OrderItem from "../components/OrderItem";
import LoadingComponent from "../components/LoadingComponent";
import ErrorComponent from "../components/ErrorComponent";

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [first, setFirst] = useState(true);

    const load = () => {
        setLoading(true);
        $.ajax('/api/collection/orders', {
            success: result => {
                setOrders(result);
                setLoading(false);
                setFirst(false);
            },
            error: () => {
                setError(true);
            }
        })
    }

    const cancel = (id: number) => {
        setLoading(false);
        $.ajax(`/api/collection/order/${id}`, {
            method: 'DELETE',
            success: () => {
                load();
            },
            error: () => {
                setError(true);
            }
        })
    }
    useEffect(() => {
        document.title = 'Заказы - Sterling';
    }, []);

    useEffect(() => {
        load();
    }, []);

    return (
        <div>
            {loading && first && !error && <LoadingComponent />}
            {error && <ErrorComponent />}
            {!loading && !first && orders.map(t => <OrderItem key={`order-${t.id}`} item={t} cancel={() => cancel(t.id)} loading={loading} />)}
        </div>
    );
}