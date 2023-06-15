import { useEffect, useState } from "react";
import { Product } from "../models/Product";
import $ from 'jquery';
import ProductItem from "../components/ProductItem";
import '../styles/Main.css';
import { useLocation, useNavigate } from "react-router-dom";
import { p } from "../Utils";
import { setCategories, useAppDispatch, useAppSelector } from "../store";
import '../styles/Category.css';
import LoadingComponent from "../components/LoadingComponent";
import ErrorComponent from "../components/ErrorComponent";

export default function Category() {
    const dispatcher = useAppDispatch();
    const isAdmin = useAppSelector(state => state.main.profile?.isAdmin);
    const location = useLocation();
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [id, setId] = useState(+p(location.search, 'id'));
    const [title, setTitle] = useState('');
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [end, setEnd] = useState(false);
    const [error, setError] = useState(false);
    const [items, setItems] = useState<Product[]>([]);

    const getProducts = () => {
        $.ajax(`/api/product/category/${id}/${page + 1}`, {
            success: (result) => {
                if (result.length == 0)
                    setEnd(true);
                else
                    setItems([...items, ...result]);
                setLoadingProduct(false);
                setPage(page + 1);
            },
            error: () => {
                setLoadingProduct(false);
                setError(true);
            }
        });
    }

    const checkEdge = () => {
        if (window.innerHeight + Math.ceil(window.scrollY) >= document.body.offsetHeight - 50 &&
            !loadingProduct && !end) {
            getProducts();
            setLoadingProduct(true);
        }
    };

    const remove = () => {
        $.ajax(`/api/category/${id}`, {
            method: 'DELETE',
            success: () => {
                $.ajax('/api/category', {
                    success: result => {
                        dispatcher(setCategories(result));
                        navigate('/');
                    }
                })
            }
        })
    }
    
    useEffect(() => {
        if (title) document.title = `${title} - Sterling`;
        else document.title = 'Категория - Sterling';
    }, [title]);

    useEffect(() => {
        $.ajax('/api/category', {
            success: (result: any[]) => {
                const cat = result.find(t => t.id == id);
                if (cat) setTitle(cat.title);
                else setError(true);
            }
        });
    }, []);

    useEffect(() => {
        getProducts();
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', checkEdge);
        return () => window.removeEventListener('scroll', checkEdge);
    }, []);

    return (
        <div>
            {isAdmin &&
                <div id='admin-category-panel'>
                    <div className='btn btn-outline-success' onClick={() => navigate(`/category-form?id=${id}`)}>
                        Редактировать
                    </div>
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
            {loadingProduct && <LoadingComponent />}
            {error && !page && <ErrorComponent />}
            {!loadingProduct && !error &&
                <div id='main-container'>
                    {items.map(t => <ProductItem product={t} key={`prod${t.id}`} />)}
                </div>}
        </div>
    );
}