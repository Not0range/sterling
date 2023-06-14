import { useState } from "react";
import $ from 'jquery';
import { Modal } from "bootstrap";

export default function CategoryDialog(props: IProps) {
    const [title, setTitle] = useState(props.title ?? '');
    const [error, setError] = useState(false);

    const submit = () => {
        if (title.length == 0 || error) return;

        $.ajax('/api/category' + (props.id ? `/${props.id}` : ''), {
            method: props.id ? 'POST' : 'PUT',
            data: JSON.stringify(title),
            contentType: 'application/json; charset=utf-8;',
            processData: false,
            success: result => {
                const modal = document.querySelector(`#${props.elemId}`);
                if (modal) {
                    Modal.getInstance(modal)?.toggle();
                }
                if (props.onSubmit) props.onSubmit(result.id);
            },
            error: () => {
                setError(true)
            }
        });
    }

    return (
        <div className='modal' id={props.elemId} aria-hidden>
            <div className='modal-dialog'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h1 className='modal-title fs-5'>
                            {props.title ? 'Изменить название категории' : 'Добавить категорию'}
                        </h1>
                        <button type='button' className='btn-close' data-bs-dismiss='modal' />
                    </div>
                    <div className='modal-body'>
                        {error && <div className='alert alert-danger' role='alert'>
                            Данная категория уже существует
                        </div>}
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Название категории'
                            onChange={e => setTitle(e.target.value)}
                            value={title}
                        />
                    </div>
                    <div className='modal-footer'>
                        <button
                            type='button'
                            className='btn btn-primary'
                            onClick={submit}
                            disabled={title.length == 0 || error}
                        >
                            {props.title ? 'Сохранить' : 'Создать'}
                        </button>
                        <button type='button'
                            className='btn btn-secondary' data-bs-dismiss='modal'>Отмена</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface IProps {
    elemId: string;
    id?: number;
    title?: string;
    onSubmit?: (id: number) => void;
}