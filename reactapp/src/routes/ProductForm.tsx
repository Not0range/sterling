import { useEffect, useState } from "react";
import { Form, Link, useLocation, useNavigate } from "react-router-dom";
import $ from 'jquery';
import { p, replace } from "../Utils";
import { ProductDetail, ProductType } from "../models/Product";
import { pushNotification, useAppDispatch, useAppSelector } from "../store";
import '../styles/ProductForm.css';

export default function ProductForm() {
    const isAdmin = useAppSelector(state => state.main.profile?.isAdmin);
    const categories = useAppSelector(state => state.main.categories);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatcher = useAppDispatch();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [id, setID] = useState(-1);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(-1);
    const [description, setDescription] = useState('');
    const [types, setTypes] = useState<ProductType[]>([]);
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        console.log('asdasd');

        setError(false);
        if (!isAdmin) {
            setLoading(false);
            setError(true);
            return;
        }

        const str = p(location.search, 'id');
        if (str.length == 0) {
            setID(-1);
            setTitle('');
            setCategory(-1);
            setDescription('');
            setTypes([]);

            setLoading(false);
            return;
        }
        setID(+str);
        $.ajax(`/api/product/id/${str}`, {
            success: (result) => {
                setLoading(false);
                setTitle(result.title);
                setCategory(result.categoryId);
                setDescription(result.description);
                setTypes(result.types);
            },
            error: () => {
                setLoading(false);
                setError(true);
            }
        })
    }, [isAdmin, location]);

    const addType = () => {
        setTypes([...types, { title: '', price: 0, id: -1, cart: 0, image: false }]);
        setSelected(types.length);
    }

    const removeType = () => {
        setTypes([...replace(types, selected)]);
        setSelected(selected - 1);
    }

    const setTypeTitle = (value: string) => {
        setTypes([...replace(types, selected, { ...types[selected], title: value })]);
    }

    const setTypePrice = (value: number) => {
        if (isNaN(value) || value < 0) return;
        setTypes([...replace(types, selected, { ...types[selected], price: value })]);
    }

    const save = (e: any) => {
        if (!title || !description || category == -1 || types.length == 0) {
            dispatcher(pushNotification({ text: 'Необходимо заполнить все поля', type: 'danger' }));
            return;
        }
        $.ajax('/api/product' + (id != -1 ? `/${id}` : ''), {
            method: id == -1 ? 'PUT' : 'POST',
            processData: false,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                categoryId: category,
                title: title,
                description: description,
                types: types.map(t => ({
                    id: t.id != -1 ? t.id : null,
                    title: t.title,
                    price: t.price
                }))
            }),
            success: async result => {
                const form = new FormData(document.querySelector('#imgs-form') as HTMLFormElement);
                const files = [...form.values()];

                for (let i = 0; i < files.length; i++) {
                    if ((files[i] as File).name.length == 0) continue;

                    const data = new FormData();
                    data.append('file', files[i]);
                    await $.ajax(`/api/images/${result.types[i].id}`, {
                        method: 'POST',
                        processData: false,
                        contentType: false,
                        data,
                        error: () => {
                            dispatcher(pushNotification({
                                text: 'Ошибка загрузки файла',
                                type: 'danger'
                            }));
                        }
                    });
                }
                navigate(`/product?id=${result.id}`);
            },
            error: () => {
                dispatcher(pushNotification({
                    text: 'Ошибка сохранения данных',
                    type: 'danger'
                }));
            }
        });
    }

    return (
        <div>
            {loading && !error && <p>Loading...</p>}
            {error && <p>Error!</p>}
            {!loading &&
                <div>
                    <div id='admin-panel'>
                        <div className="btn btn-outline-primary" onClick={save}>Сохранить</div>
                        <div style={{ width: '5px' }} />
                        <Link to={id != -1 ? `/product?id=${id}` : '/'} className="btn btn-outline-danger">Отмена</Link>
                    </div>
                    <div id='form-container'>
                        <div>
                            <p>Название</p>
                            <input type='text' value={title} onChange={e => setTitle(e.target.value)} />
                            <p>Категория</p>
                            <select onChange={e => setCategory(+e.target.value)} value={`${category}`}>
                                <option value='-1'>-</option>
                                {categories.map(t =>
                                    <option key={`opt-${t.id}`} value={t.id}>{t.title}</option>)}
                            </select>
                            <p>Описание</p>
                            <textarea onChange={e => setDescription(e.target.value)} value={description} />
                        </div>
                        <div>
                            <p>Виды товара</p>
                            <div id='types-row'>
                                {types.map((t, i) =>
                                    <div key={`types-${i}`}
                                        className={'type btn ' + (i == selected ? 'btn-primary' : 'btn btn-outline-primary')}
                                        onClick={() => setSelected(i)}
                                    >
                                        {t.title}
                                    </div>)}
                                <div className={'btn btn-outline-primary'}
                                    onClick={addType}
                                >
                                    +
                                </div>
                                <div style={{ flexGrow: 1 }} />
                                <div className={'btn btn-outline-danger'}
                                    onClick={removeType}
                                    style={{ display: types.length > 0 ? 'block' : 'none' }}
                                >
                                    X
                                </div>
                            </div>
                            <div style={{ flexDirection: 'column', display: types.length > 0 ? 'flex' : 'none' }}>
                                <p>Название</p>
                                <input
                                    type='text'
                                    value={types[selected]?.title ?? ''}
                                    onChange={e => setTypeTitle(e.target.value)}
                                />
                                <p>Стоимость</p>
                                <input
                                    type='number'
                                    value={types[selected]?.price.toFixed(2) ?? 0}
                                    onChange={e => setTypePrice(+e.target.value)}
                                />
                                <p>{types[selected]?.image ? 'Текущее изображение' : 'Изображение отсутствует'}</p>
                                {types[selected]?.image && <img className='type-img'
                                    src={`api/images/${types[selected].id}`}
                                />}
                                <Form id='imgs-form'>
                                    {types.map((t, i) =>
                                        <input
                                            key={`img-${i}`}
                                            type='file'
                                            accept='image/*'
                                            name={`img-${i}`}
                                            style={{ display: selected == i ? "block" : "none" }}
                                        />)}
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>}
        </div>
    )
}