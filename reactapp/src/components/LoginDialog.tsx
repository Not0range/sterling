import { useState } from "react";
import { setProfile, useAppDispatch } from "../store";
import '../styles/components/LoginDialog.css'
import $ from 'jquery';
import { Modal } from "bootstrap";
import { Link } from "react-router-dom";

export default function LoginDialog() {
    const dispatcher = useAppDispatch();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const submit = () => {
        if (username.length == 0 || password.length == 0 || error) return false;

        const data = new FormData(document.querySelector('#login-form') as HTMLFormElement);
        $.ajax('/api/user/login', {
            method: 'POST',
            data: data,
            processData: false,
            contentType: false,
            success: result => {
                dispatcher(setProfile(result));
                const modal = document.querySelector('#login-modal');
                if (modal) {
                    Modal.getInstance(modal)?.toggle();
                }
            },
            error: () => {
                setError(true);
            }
        })
        return false;
    }

    return (
        <div className='modal' id='login-modal' aria-hidden>
            <div className='modal-dialog'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h1 className='modal-title fs-5'>Вход</h1>
                        <button type='button' className='btn-close' data-bs-dismiss='modal' />
                    </div>
                    <div className='modal-body'>
                        {error && <div className='alert alert-danger' role='alert'>
                            Неправильные имя пользователя, e-mail и/или пароль
                        </div>}
                        <form id='login-form'>
                            <input
                                type='text'
                                name='username'
                                className='form-control'
                                placeholder='Имя пользователя/email'
                                onChange={e => setUsername(e.target.value)}
                                onFocus={() => setError(false)}
                                value={username}
                            />
                            <input
                                type='password'
                                name='password'
                                className='form-control'
                                placeholder='Пароль'
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setError(false)}
                                value={password}
                            />
                        </form>
                        <Link to='/'>Забыли пароль?</Link>
                    </div>
                    <div className='modal-footer'>
                        <button
                            type='button'
                            className='btn btn-primary'
                            onClick={submit}
                            disabled={username.length == 0 || password.length == 0 || error}
                        >
                            Войти
                        </button>
                        <button type='button'
                            className='btn btn-secondary' data-bs-dismiss='modal'>Отмена</button>
                    </div>
                </div>
            </div>
        </div>
    );
}