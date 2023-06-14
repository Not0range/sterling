import { useEffect } from "react";

export default function About() {
    useEffect(() => {
        document.title = 'О компании - Sterling';
    }, []);
    return (
        <div></div>
    );
}