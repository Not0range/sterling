import { useEffect, useState } from "react";
import { hideForm, setProfile, useAppDispatch, useAppSelector } from "../store";
import '../styles/components/LoginDialog.css'
import $ from 'jquery';

export default function LoginDialog() {
    const visible = useAppSelector(state => state.main.formVisible);
    const dispatcher = useAppDispatch();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const div = document.querySelector('#login-dialog');
        const close = (e: any) => {
            if (e.target == div)
                dispatcher(hideForm());
        };

        div?.addEventListener('click', close);
        return () => div?.removeEventListener('click', close);
    }, []);

    const submit = () => {
        if (username.length == 0 || password.length == 0) return false;

        const data = new FormData(document.querySelector('#login-form') as HTMLFormElement );
        
        $.ajax('/api/user/login', {
            method: 'POST',
            data: data,
            processData: false,
            contentType: false,
            success: result => {
                dispatcher(setProfile(result));
                dispatcher(hideForm());
            },
            error: () => {
                alert('Wrong');
            }
        })
        return false;
    }

    return (
        <div style={{ visibility: visible ? 'visible' : 'hidden' }}>
            <div id='login-dialog'>
                <form id='login-form' onSubmit={submit}>
                    <h4>Вход</h4>
                    <input
                        name='username'
                        type='text'
                        onChange={e => setUsername(e.target.value)}
                        value={username}
                        placeholder='E-mail или имя пользователя'
                        required
                    />
                    <input
                        name='password'
                        type='password'
                        onChange={e => setPassword(e.target.value)}
                        value={password}
                        placeholder='Пароль'
                        required
                    />
                    <input type='button' onClick={submit} value='Войти' />
                </form>
            </div>
        </div>
    );
}