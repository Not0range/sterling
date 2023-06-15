import { Link, useNavigate } from "react-router-dom";
import '../styles/components/Header.css';
import SearchInput from "./SearchInput";
import HeaderButton from "./HeaderButton";
import { setProfile, useAppDispatch, useAppSelector } from "../store";
import $ from 'jquery';
import LoginDialog from "./LoginDialog";
import RegisterDialog from "./RegisterDialog";

export default function Header() {
    const profile = useAppSelector(state => state.main.profile);
    const navigate = useNavigate();
    return (
        <div>
            <div id='top-header'>
            <HeaderButton text='О компании' link='/about' />
            <HeaderButton text='Магазины' link='/shops' />
            <HeaderButton text='Скидки' link='/discount' />
            <HeaderButton text='Рассрочка' link='/payment' />
                <div style={{ flex: 1 }} />
                {profile != null &&
                    <div id='greetings-box'>
                        <div id='greetings'>
                            <p>Здравствуйте, {profile.name}</p>
                        </div>
                        <div className='dropdown align-self-center'>
                            <button className='btn dropdown-toggle' data-bs-toggle='dropdown' aria-expanded='false'>
                                <i className='bx bx-menu bx-sm' />
                            </button>
                            <ul className='dropdown-menu'>
                                <li>
                                    <Link className='dropdown-item' to='/orders'>
                                        <i className='bx bx-category bx-sm' />Заказы
                                    </Link>
                                </li>
                                <li>
                                    <Link className='dropdown-item' to='/cart'>
                                        <i className='bx bx-cart bx-sm' />
                                        Корзина
                                        {profile.cartCount > 0 && <span className='position-absolute badge rounded-pill bg-danger'>
                                            {profile.cartCount}
                                        </span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link className='dropdown-item' to='/history'>
                                        <i className='bx bx-history bx-sm' />История
                                    </Link>
                                </li>
                                <li>
                                    <Link className='dropdown-item' to='/bookmark'>
                                        <i className='bx bx-heart bx-sm' />Избранное
                                    </Link>
                                </li>
                                <li><hr className='dropdown-divider' /></li>
                                {profile.isAdmin &&
                                    <li>
                                        <Link className='dropdown-item' to='/orders/admin'>
                                            <i className='bx bx-chart bx-sm' />Управление заказами
                                        </Link>
                                    </li>}
                            </ul>
                        </div>
                        {profile.isAdmin &&
                            <div id='admin-control'>
                                <div className='btn btn-outline-success' onClick={() => navigate('/product-form')}>
                                    <p>Создать товар</p>
                                </div>
                                <div className='btn btn-outline-success' onClick={() => navigate('/category-form')}>
                                    <p>Создать категорию</p>
                                </div>
                            </div>}
                    </div>}
                <LoginButton loggedIn={profile != null} />
                <LoginDialog />
                {profile == null && <RegisterButton />}
                <RegisterDialog />
            </div>
            <div id='header'>
                <Link to='/' id='main-logo'>
                    <img src='/logo.png' />
                </Link>
                <SearchInput />
            </div>
        </div>
    );
}

function LoginButton({ loggedIn }: IProps) {
    const dispatcher = useAppDispatch();
    const logout = () => {
        $.ajax('/api/user/logout', {
            success: () => {
                dispatcher(setProfile(null));
            }
        })
    };
    return !loggedIn ? (
        <div className='login-button' data-bs-toggle='modal' data-bs-target='#login-modal'>
            <i className='bx bx-log-in bx-sm' />
            <p>Вход</p>
        </div>) :
        (<div className='login-button' onClick={logout}>
            <i className='bx bx-log-out bx-sm' />
            <p>Выход</p>
        </div>);
}

function RegisterButton() {
    return (
        <div className='login-button' data-bs-toggle='modal' data-bs-target='#register-modal'>
            <i className='bx bxs-user-detail bx-sm' />
            <p>Регистрация</p>
        </div>);
}
interface IProps {
    loggedIn: boolean
}