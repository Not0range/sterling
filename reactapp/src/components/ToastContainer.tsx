import { useEffect } from "react";
import { useAppSelector } from "../store";
import ToastAlert from "./ToastAlert";
import { Toast } from "bootstrap";

export default function ToastContainer() {
    const notifications = useAppSelector(state => state.main.notifications);
    useEffect(() => {
        const toastElem = document.querySelector(`#toast-alert-${notifications.length - 1}`);
        if (toastElem) { 
            Toast.getOrCreateInstance(toastElem).show();
            
         }
    });
    return (
        <div id='toast-container' className='toast-container position-fixed bottom-0 end-0 p-3' >
            {notifications.map((t, i) => <ToastAlert key={`toast-${i}`} id={`toast-alert-${i}`} text={t.text} type={t.type} />)}
        </div>
    )
}