import { useEffect, useState } from 'react';
import { Order } from '../models/Order';
import OrderItem from '../components/OrderItem';
import $ from 'jquery';
import { error } from 'console';
import LoadingComponent from '../components/LoadingComponent';
import ErrorComponent from '../components/ErrorComponent';

export default function OrdersControl() {
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
    useEffect(() => {
        document.title = 'Управление заказами - Sterling';
    }, []);

    useEffect(() => {
        load();
    }, []);

    const complete = (userId: number, id: number) => {
        setLoading(false);
        $.ajax(`/api/collection/order/admin/${userId}?id=${id}`, {
            method: 'POST',
            success: () => {
                load();
            },
            error: () => {
                setError(true);
            }
        })
    }

    const cancel = (userId: number, id: number) => {
        setLoading(false);
        $.ajax(`/api/collection/order/admin/${userId}?id=${id}`, {
            method: 'DELETE',
            success: () => {
                load();
            },
            error: () => {
                setError(true);
            }
        })
    }

    return (
        <div>
        {orders.length == 0 && !error && <LoadingComponent />}
        {error && <ErrorComponent />}
            {orders.map(t =>
                <OrderItem
                    key={`order-${t.id}`}
                    item={t}
                    loading={loading}
                    complete={() => complete(t.userId, t.id)}
                    cancel={() => cancel(t.userId, t.id)}
                />)}
        </div>
    );
}