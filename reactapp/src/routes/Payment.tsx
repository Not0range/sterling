import { useEffect } from "react";
import '../styles/Payment.css';

export default function Payment() {
    useEffect(() => {
        document.title = 'Рассрочка - Sterling';
    }, []);
    return (
        <div className="payment-page">
            <div className="split-container">
                <div>
                    <h3><b>Уважаемые клиенты !!!</b></h3>
                    <h3>Компания «Стерлинг» предоставляет РАССРОЧКУ на весь ассортимент товара в размере 0% по розничной цене.</h3>
                    <h3>Срок рассрочки — 3 месяца.</h3>
                    <h3>Рассрочку можно оформить в любом магазине компании при покупке товара на сумму от 300 руб.</h3>
                    <h3>Для оформения рассрочки Вам понадобиться карта «Клевер» наших банков-партнеров:</h3>
                    <br />
                    <h3>ЗАО «Агропромбанк».</h3>
                    <h3>ЗАО «Приднестровский Сбербанк».</h3>
                </div>
                <div>
                    <img src="payment.jpg" />
                </div>
            </div>
        </div>
    )
}