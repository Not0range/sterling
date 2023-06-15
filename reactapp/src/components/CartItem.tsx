import { useState } from "react";
import { CartProduct } from "../models/Order"
import '../styles/components/CartItem.css';

export default function CartItem({ item, loading, ...props }: IProps) {
    const [url, setUrl] = useState(`api/images/product/${item.id}`);
    const [cart, setCart] = useState(item);

    const onError = () => {
        if (url == `api/images/product/${item.id}`)
            setUrl('placeholder.png');
    }
    const setCount = (count: number) => {
        setCart({ ...cart, count });
        if (props.setCount) props.setCount(count);
    }

    return (
        <div className='cart-item'>
            <img src={url} onError={onError} />
            <h1>{`${item.groupTitle} (${item.title})`}</h1>
            <div>
                <div className='btn-group' role='group' aria-label='cart-group'>
                    <input className='btn btn-outline-primary' type='button' value='-'
                        onClick={() => setCount(item.count - 1 < 1 ? 1 : item.count - 1)} disabled={loading} />
                    <input
                        id='cart-counter'
                        type='number'
                        value={cart.count}
                        onChange={(e) => setCount(+e.target.value < 1 ? 1 : +e.target.value)}
                        disabled={loading}
                    />
                    <input className='btn btn-outline-primary' type='button' value='+'
                        onClick={() => setCount(item.count + 1)} disabled={loading} />
                </div>
            </div>
            <h2>{cart.count * cart.price} р.</h2>
            <i
                className='bx bx-x bx-md'
                onClick={() => !loading && setCount(0)}
                style={{ cursor: 'pointer' }}
            />
        </div>
    )
}

interface IProps {
    item: CartProduct;
    setCount?: (value: number) => void;
    loading?: boolean;
}