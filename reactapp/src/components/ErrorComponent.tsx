import '../styles/components/ErrorComponent.css'

export default function ErrorComponent() {
    return (
        <div className="error-container">
            <p>Произошла ошибка при загрузке данных. 
            Пожалуйста, перезагрузите страницу или повторите попытку позже</p>
        </div>
    )
}