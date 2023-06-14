import { Order, OrderSubItem } from "../models/Order";
import '../styles/components/OrderItem.css';

export default function OrderItem({ item, loading, cancel, complete }: IProps) {
    return (
        <div className='order-item'>
            <div className='order-item-div'>
                <h4>Номер заказа</h4>
                <h4>{item.id}</h4>
            </div>
            <div className='order-item-div'>
                <h4>Статус</h4>
                <h4>{getTextStatus(item.status)}</h4>
            </div>
            <div style={{ flexGrow: 10 }}>
                <h4>Заказ</h4>
                {item.items.map(t => <SubItem key={`${item.id}-${t.id}`} item={t} />)}
            </div>
            <div className='order-item-div'>
                <h4>Стоимость</h4>
                <h4>{item.totalPrice} р.</h4>
            </div>
            {item.status != 0 || complete == null ?
                <div className='button-div'>
                    <button className={'btn btn-outline-' + (item.status == 2 ? 'success' : 'danger')} disabled={loading || item.status != 0} onClick={() => cancel && cancel()}>
                        {getTextButton(item.status)}
                    </button>
                </div> :
                <div className='button-div'>
                    <button className='btn btn-outline-success' disabled={loading || item.status != 0} onClick={() => complete && complete()}>
                        Завершить заказ
                    </button>
                    <button className='btn btn-outline-danger' disabled={loading || item.status != 0} onClick={() => cancel && cancel()}>
                        {getTextButton(item.status)}
                    </button>
                </div>}
        </div>
    );
}

interface IProps {
    item: Order;
    loading?: boolean;
    complete?:  () => void;
    cancel?: () => void;
}

function SubItem({ item }: { item: OrderSubItem }) {
    return (
        <div>
            <div className='subitem-div'>
                <p style={{ flexGrow: 1 }}>{`${item.groupTitle} (${item.title})`}</p>
                <p>{item.count} шт.</p>
            </div>
            <hr style={{ margin: '0' }} />
        </div>
    )
}

function getTextStatus(status: number): string {
    switch (status) {
        case 0:
            return 'В процессе';
        case 1:
            return 'Отменён';
        case 2:
            return 'Завершён';
        default:
            return '';
    }
}

function getTextButton(status: number): string {
    switch (status) {
        case 0:
            return 'Отменить заказ';
        case 1:
            return 'Заказ отменён';
        case 2:
            return 'Заказ завершён';
        default:
            return '';
    }
}