import { Link } from "react-router-dom";
import '../styles/components/Header.css';
import SearchInput from "./SearchInput";
import HeaderButton from "./HeaderButton";
import { setProfile, showForm, useAppDispatch, useAppSelector } from "../store";
import $ from 'jquery';

export default function Header() {
    const profile = useAppSelector(state => state.main.profile);
    return (
        <div>
            <div id='top-header'>
                <HeaderButton text='О магазине' link='/about' />
                <div style={{ flex: 1 }} />
                {profile != null &&
                    <div id='greetings-box'>
                        <div id='greetings'>
                            <p>Здравствуйте, {profile.name}</p>
                        </div>
                        {profile.isAdmin && 
                        <div id='admin-control'>
                            <Link to='/product-form' className='login-button'>
                                <p>Создать товар</p>
                            </Link>
                            <Link to='' className='login-button'>
                                <p>Создать категорию</p>
                            </Link>
                        </div>}
                    </div>}
                <LoginButton loggedIn={profile != null} />
            </div>
            <div id='header'>
                <Link to='/'>
                    <h1>Logo</h1>
                </Link>
                <SearchInput />
            </div>
        </div>
    );
}

function LoginButton({ loggedIn }: IProps) {
    const dispatcher = useAppDispatch();
    const show = () => {
        dispatcher(showForm());
    }
    const logout = () => {
        $.ajax('/api/user/logout', {
            success: () => {
                dispatcher(setProfile(null));
            }
        })
    };
    return !loggedIn ? (
        <div className='login-button' onClick={show}>
            <i className='bx bx-log-in bx-sm' />
            <p>Вход</p>
        </div>) :
        (<div className='login-button' onClick={logout}>
            <i className='bx bx-log-out bx-sm' />
            <p>Выход</p>
        </div>);
}
interface IProps {
    loggedIn: boolean
}