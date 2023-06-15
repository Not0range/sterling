import { useEffect, useState } from "react";
import { Form, Link, useLocation, useNavigate } from "react-router-dom";
import $ from 'jquery';
import { p } from "../Utils";
import { pushNotification, setCategories, useAppDispatch, useAppSelector } from "../store";
import '../styles/CategoryForm.css';
import LoadingComponent from "../components/LoadingComponent";
import ErrorComponent from "../components/ErrorComponent";

export default function CategoryForm() {
    const categories = useAppSelector(state => state.main.categories);

    const isAdmin = useAppSelector(state => state.main.profile?.isAdmin);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatcher = useAppDispatch();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const [id, setID] = useState(-1);
    const [title, setTitle] = useState('');

    const [imgError, setImgError] = useState(false);

    const onError = () => {
        setImgError(true);
    }

    useEffect(() => {
        setImgError(false);
    }, [id]);

    useEffect(() => {
        document.title = 'Управление категорией - Sterling';
    }, []);

    useEffect(() => {
        setError(false);
        if (!isAdmin) {
            setError(true);
            return;
        }

        const str = p(location.search, 'id');
        if (str.length == 0) {
            setID(-1);
            setTitle('');
            setLoading(false);
            return;
        }
        setID(+str);
        setTitle(categories.find(t => t.id == +str)?.title ?? '');
    }, [isAdmin, location]);

    const save = (e: any) => {
        if (!title) {
            dispatcher(pushNotification({ text: 'Необходимо заполнить все поля', type: 'danger' }));
            return;
        }
        $.ajax('/api/category' + (id != -1 ? `/${id}` : ''), {
            method: id == -1 ? 'PUT' : 'POST',
            processData: false,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(title),
            success: async result => {
                const form = new FormData(document.querySelector('#img-form') as HTMLFormElement);

                if ((form.get('file') as File).size > 0) {
                    await $.ajax(`/api/images/category/${result.id}`, {
                        method: 'POST',
                        processData: false,
                        contentType: false,
                        data: form,
                        error: () => {
                            dispatcher(pushNotification({
                                text: 'Ошибка загрузки файла',
                                type: 'danger'
                            }));
                        }
                    });
                }
                await $.ajax('/api/category', {
                    success: result => {
                        dispatcher(setCategories(result));
                    }
                })
                navigate(`/category?id=${result.id}`);
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
            {loading && !error && <LoadingComponent />}
            {error && <ErrorComponent />}
            {!loading && !error &&
                <div>
                    <div id='category-admin-panel'>
                        <div className="btn btn-outline-primary" onClick={save}>Сохранить</div>
                        <div style={{ width: '5px' }} />
                        <Link to={id != -1 ? `/category?id=${id}` : '/'} className="btn btn-outline-danger">Отмена</Link>
                    </div>
                    <div id='category-form-container'>
                        <p>Название</p>
                        <input type='text' value={title} onChange={e => setTitle(e.target.value)} />
                        <p>{!imgError ? 'Текущее изображение' : 'Изображение отсутствует'}</p>
                        {!imgError && <img className='type-img' onError={onError}
                            src={`api/images/category/${id}`}
                        />}
                        <Form id='img-form'>
                            <input
                                key={`img`}
                                type='file'
                                accept='image/*'
                                name={`file`}
                            />
                        </Form>
                    </div>
                </div>}
        </div>
    )
}