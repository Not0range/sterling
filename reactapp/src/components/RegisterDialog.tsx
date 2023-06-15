import { useEffect, useState } from "react";
import { setProfile, useAppDispatch } from "../store";
import '../styles/components/LoginDialog.css'
import $ from 'jquery';
import { Modal } from "bootstrap";

export default function RegisterDialog() {
    const dispatcher = useAppDispatch();

    const [error, setError] = useState(false);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    useEffect(() => {
        setError(false);
    }, [username, name, email, phone, password, password2]);

    const submit = () => {
        if (username.length == 0 ||
            password.length == 0 ||
            name.length == 0 ||
            email.length == 0 ||
            !/^77\d{6}$/.test(phone) ||
            password != password2) {
            setError(true);
            return false;
        }

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
                setError(true);
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
                        {error && <div className='alert alert-danger' role='alert'>
                            Введены неверные данные
                        </div>}
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
                                type='tel'
                                name='phone'
                                className='form-control'
                                placeholder='Номер телефона (77XXXXXX)'
                                onChange={e => setPhone(e.target.value)}
                                value={phone}
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