import { Link } from "react-router-dom";
import { Category } from "../models/Product";
import '../styles/components/CategoryItem.css';
import { useState } from "react";

export default function CategoryItem({category}: IProps) {
    const [url, setUrl] = useState(`api/images/category/${category.id}`);

    const onError = () => {
        if (url == `api/images/category/${category.id}`)
            setUrl('placeholder.png');
    }

    return (
        <Link to={`/category?id=${category.id}`} className='category-item'>
            <p>{category.title}</p>            
            <img src={url} onError={onError} />
        </Link>
    );
}

interface IProps {
    category: Category;
}