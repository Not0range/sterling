import { useEffect } from 'react';
import '../styles/Shops.css'

export default function Shops() {
    useEffect(() => {
        document.title = 'Магазины - Sterling';
    }, []);
    return (
        <div className="shops-page">
            <div className="shop-container">
                <div className='shop-description'>
                    <h1>Магазин-склад</h1>
                    <p>г. Тирасполь</p>
                    <p>ул. Восстания, 4.</p>
                    <p>тел.0(533)55045</p>
                    <p><i>e-mail:sterling2@idknet.com</i></p>
                </div>
                <div className='shop-img'>
                    <img src='/shops/1.jpg' />
                </div>
            </div>
            <div className="shop-container">
                <div className='shop-img'>
                    <img src='/shops/2.jpg' />
                </div>
                <div className='shop-description'>
                    <h1>Карандаш</h1>
                    <p>г. Тирасполь</p>
                    <p>ул. Луначарского, 24.</p>
                    <p>тел.0(533)84309</p>
                    <p><i>e-mail:sterling4@idknet.com</i></p>
                </div>
            </div>
            <div className="shop-container">
                <div className='shop-description'>
                    <h1>Канцтовары</h1>
                    <p>г. Тирасполь</p>
                    <p>ул. Восстания, 4.</p>
                    <p>тел.0(533)55045</p>
                    <p><i>e-mail:sterling2@idknet.com</i></p>
                </div>
                <div className='shop-img'>
                    <img src='/shops/3.png' />
                </div>
            </div>
        </div>
    )
}