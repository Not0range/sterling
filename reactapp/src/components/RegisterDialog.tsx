import { useState } from "react";
import { setProfile, useAppDispatch } from "../store";
import '../styles/components/LoginDialog.css'
import $ from 'jquery';
import { Modal } from "bootstrap";

export default function RegisterDialog() {
    const dispatcher = useAppDispatch();

    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const submit = () => {
        if (username.length == 0 || 
            password.length == 0 || 
            name.length == 0 || 
            email.length == 0 ||
            password != password2) return false;

        const data = new FormData(document.querySelector('#register-form') as HTMLFormElement);

        $.ajax('/api/user/register', {
            method: 'POST',
            data: data,
            processData: false,
            contentType: false,
            success: result => {
                dispatcher(setProfile(result));
                const modal = document.querySelector('#register-modal');
                if (modal) {
                    Modal.getInstance(modal)?.toggle();
                }
            },
            error: () => {
                alert('Wrong');
            }
        })
        return false;
    }

    return (
        <div className='modal' id='register-modal' aria-hidden>
            <div className='modal-dialog'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h1 className='modal-title fs-5'>Регистрация</h1>
                        <button type='button' className='btn-close' data-bs-dismiss='modal' />
                    </div>
                    <div className='modal-body'>
                        <form id='register-form'>
                            <input
                                type='text'
                                name='username'
                                className='form-control'
                                placeholder='Логин'
                                onChange={e => setUsername(e.target.value)}
                                value={username}
                            />
                            <input
                                type='email'
                                name='email'
                                className='form-control'
                                placeholder='Адрес эл. почты'
                                onChange={e => setEmail(e.target.value)}
                                value={email}
                            />
                            <input
                                type='text'
                                name='name'
                                className='form-control'
                                placeholder='Имя'
                                onChange={e => setName(e.target.value)}
                                value={name}
                            />
                            <input
                                type='password'
                                name='password'
                                className='form-control'
                                placeholder='Пароль'
                                onChange={e => setPassword(e.target.value)}
                                value={password}
                            />
                            <input
                                type='password'
                                className='form-control'
                                placeholder='Потвердите ароль'
                                onChange={e => setPassword2(e.target.value)}
                                value={password2}
                            />
                        </form>
                    </div>
                    <div className='modal-footer'>
                        <button type='button' className='btn btn-primary' onClick={submit}>Зарегистрироваться</button>
                        <button type='button'
                            className='btn btn-secondary' data-bs-dismiss='modal'>Отмена</button>
                    </div>
                </div>
            </div>
        </div>
    );
}