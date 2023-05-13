import { Link, } from "react-router-dom";
import '../styles/components/HeaderButton.css';

export default function HeaderButton(props: IProps) {
    return (
        <Link to={props.link}>
            <div className='header-button'>
                {props.prefix}
                <p>{props.text}</p>
            </div>
        </Link>
    )
}

interface IProps {
    text: string;
    link: string;
    prefix?: JSX.Element;
}