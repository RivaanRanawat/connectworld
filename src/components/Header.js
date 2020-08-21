import React from 'react';
import {Link} from "react-router-dom";
import "./Header.css";

export default function Header() {
    return (
        <header className="header-login-signup">
            <div className="header-limiter">
                <h1><a href="/">Connect<span>World</span></a></h1>
                <nav>
                    <Link to="/">
                        Home
                    </Link>
                </nav>
                <ul>
                    <li><Link to="/signup">Sign Up</Link></li>
                    <li><Link to="/login">Login</Link></li>
                </ul>
            </div>
        </header>
    )
}
