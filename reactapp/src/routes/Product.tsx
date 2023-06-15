import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import $ from 'jquery';
import { ProductDetail } from "../models/Product";
import { p } from "../Utils";
import { pushNotification, setProfile, useAppDispatch, useAppSelector } from "../store";
import '../styles/Product.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadingComponent from "../components/LoadingComponent";
import ErrorComponent from "../components/ErrorComponent";

export default function Product() {
    const dispatcher = useAppDispatch();
    const navigate = useNavigate();

    const isAdmin = useAppSelector(state => state.main.profile?.isAdmin);
    const location = useLocation();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [error, setError] = useState(false);
    const [selected, setSelected] = useState(0);
    const [img, setImg] = useState(0);
    const [count, setCount] = useState(1);
    
    useEffect(() => {
        if (product) document.title = `${product.title} - Sterling`;
        else document.title = 'Товар - Sterling';
    }, [product]);

    useEffect(() => {
        $.ajax(`/api/product/id/${p(location.search, 'id')}`, {
            success: (result) => {
                setProduct(result);
            },
            error: () => {
                setError(true);
            }
        });
    }, []);
    const types = product?.types.filter(t => t.image);

    const select = (index: number) => {
        setSelected(index);
        const i = types?.findIndex(t => t.id == product?.types[index].id) ?? -1;
        if (i >= 0) setImg(i);
    }

    const bookmark = () => {
        $.ajax(`/api/collection/bookmark/${p(location.search, 'id')}`, {
            success: () => {
                if (product) {
                    setProduct({ ...product, favorite: !product.favorite });
                    dispatcher(pushNotification({
                        text: !product.favorite ? 'Товар добавлен в избранное' : 'Товар удалён из избранного',
                        type: 'info'
                    }));
                }
            }
        });
    }

    const cart = () => {
        $.ajax(`/api/collection/cart/`, {
            method: 'POST',
            processData: false,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                id: product?.types[selected].id,
                count
            }),
            success: () => {
                dispatcher(pushNotification({ text: 'Товар добавлен в корзину', type: 'info' }));
                refreshProfile();
            }
        });
    }

    const refreshProfile = () => {
        $.ajax(`/api/user/getMe/`, {
            success: result => {
                dispatcher(setProfile(result));
            }
        });
    }

    const remove = () => {
        $.ajax(`/api/product/${product?.id}`, {
            method: 'DELETE',
            success: () => {
                navigate('/');
            }
        })
    }

    return (
        <div>
            {isAdmin && product &&
                <div id='admin-product-panel'>
                    <Link to={`/product-form?id=${product?.id}`} className="btn btn-outline-primary">Редактировать</Link>
                    <div style={{ width: '5px' }} />
                    <div className="btn btn-outline-danger" data-bs-toggle='modal' data-bs-target='#delete-modal'>Удалить</div>
                    <div className='modal' id='delete-modal' aria-hidden>
                        <div className='modal-dialog'>
                            <div className='modal-content'>
                                <div className='modal-header'>
                                    <h1 className='modal-title fs-5'>Удаление</h1>
                                    <button type='button' className='btn-close' data-bs-dismiss='modal' />
                                </div>
                                <div className='modal-body'>
                                    <p>Вы действительно желаете удалить данный товар?</p>
                                </div>
                                <div className='modal-footer'>
                                    <button type='button' className='btn btn-danger'
                                        data-bs-dismiss='modal' onClick={remove}>Удалить</button>
                                    <button type='button'
                                        className='btn btn-secondary' data-bs-dismiss='modal'>Отмена</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {product == null && !error && <LoadingComponent />}
            {error && <ErrorComponent />}
            {product &&
                <div>
                    <div id='product-main'>
                        <div id='product-image-container'>
                            <div>
                                <img src={types && types.length > 0 ? `/api/images/product/${types[img].id}` : 'placeholder.png'} />
                            </div>
                            {types && <div id='carousel'>
                                {types.map((t, i) =>
                                    <img key={`img-${i}`}
                                        className={i == img ? 'selected-img' : ''}
                                        src={`/api/images/product/${t.id}`}
                                        onPointerEnter={() => setImg(i)}
                                    />)}
                            </div>}
                        </div>
                        <div id='product-main-info'>
                            <div>
                                <h1>{product.title}</h1>
                                <h6>{product.category}</h6>
                                <div id='product-types'>
                                    {product.types.map((t, i) =>
                                        <div key={`types-${i}`}
                                            className={'type btn ' + (i == selected ? 'btn-primary' : 'btn btn-outline-primary')}
                                            onClick={() => select(i)}
                                        >
                                            {t.title}
                                        </div>)}
                                </div>
                                <h4>Цена: {product.types[selected].price} р.</h4>
                                <div>
                                    <div className='btn-group' role='group' aria-label='cart-group'>
                                        <input className='btn btn-outline-primary' type='button' value='-' onClick={() => setCount(count - 1 < 1 ? 1 : count - 1)} />
                                        <input
                                            id='cart-counter'
                                            type='number'
                                            value={count}
                                            onChange={(e) => setCount(+e.target.value < 1 ? 1 : +e.target.value)}
                                        />
                                        <input className='btn btn-outline-primary' type='button' value='+' onClick={() => setCount(count + 1)} />
                                    </div>
                                </div>
                                <div id='cart-bookmark-container'>
                                    <input
                                        className='btn btn-primary'
                                        type='button'
                                        value='Добавить в корзину'
                                        onClick={cart}
                                    />
                                    <i
                                        className={`bx bx-sm ` + (product.favorite ? 'bxs-star' : 'bx-star')}
                                        onClick={bookmark}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id='product-description'>
                        <h2>Описание</h2>
                        <p>{product.description}</p>
                    </div>
                </div>
            }

        </div>
    );
}