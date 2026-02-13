import { Link } from "react-router-dom";
import logo from "../assets/bluebird logo.png"

export default function Header(){
    return(
        <header className="w-full h-[100px] flex relative">
            <div className="w-full h-full flex items-center justify-center gap-[50px] ml-[200px]">
                <Link to="/">HOME</Link> 
                <Link to="/">HOTELS</Link>
                <Link to="/">PAGES</Link>
                <img src={logo} alt="BlueBird Logo" className="h-full"/>
                <Link to="/">TRAVELS</Link>
                <Link to="/">GALLERY</Link>
                <Link to="/">CONTACT</Link>
            </div>
            <div className="w-[200px] h-full flex justify-center items-center mr-[50px]">
                <span>(+94) 70 1950 195</span>
            </div>
        </header>
    );
}