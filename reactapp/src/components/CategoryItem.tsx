import { Link } from "react-router-dom";
import { Category } from "../models/Product";
import '../styles/components/CategoryItem.css';

export default function CategoryItem({category}: IProps) {
    return (
        <Link to={`/category?id=${category.id}`} className='category-item'>
            {category.title}
        </Link>
    );
}

interface IProps {
    category: Category;
}