export default function ToastAlert(props: IProps) {
    return (
        <div id={props.id} className={'toast align-items-center text-bg-' + props.type} 
        role='alert' aria-live='assertive' aria-atomic>
            <div className='d-flex'>
                <div className='toast-body'>
                    {props.text}
                </div>
                <button type='button' className='btn-close me-2 m-auto' data-bs-dismiss='toast' aria-label='Close' />
            </div>
        </div>
    )
}

interface IProps {
    id: string;
    text: string;
    type: 'success' | 'danger' | 'warning' | 'info';
}