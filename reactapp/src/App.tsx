import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { useEffect } from "react";
import $ from 'jquery';
import { setCategories, setProfile, useAppDispatch } from "./store";
import ToastContainer from "./components/ToastContainer";

export default function App() {
    const dispatcher = useAppDispatch();
    useEffect(() => {
        $.ajax('/api/user/getMe', {
            success: result => {
                dispatcher(setProfile(result));
            }
        });
        $.ajax('/api/category', {
            success: result => {
                dispatcher(setCategories(result));
            }
        })
    }, [])
    return (
        <div>
            <Header />
            <Outlet />
            <ToastContainer />
        </div>
    )
}