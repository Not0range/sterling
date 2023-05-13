import { Link } from 'react-router-dom';
import { Product } from '../models/Product';
import '../styles/components/ProductItem.css'
import { useState } from 'react';

export default function ProductItem({ product }: IProps) {
    const [url, setUrl] = useState(product.imageUrl);
    const onError = () => {
        if (url == product.imageUrl)
            setUrl('logo192.png');
    }
    return (
        <Link to={`/product?id=${product.id}`} className='product-item'>
            <img src={url} onError={onError} />
            <h5>{product.title}</h5>
            <div className='price-cart-row'>
                <p>{product.price}</p>
                {product.cart > 0 && <p>В корзине</p>}
            </div>
        </Link>
    );
}

interface IProps {
    product: Product;
}