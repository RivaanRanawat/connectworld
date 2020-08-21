import React from 'react';
import Header from "../../components/Header";
import {Link} from "react-router-dom";
import "./Home.css";

export default function Home() {
    return (
        <div>
            <Header/>
            <div className="splash-container">
                <div className="splash">
                    <h1 className="splash-head">CONNECT WORLD</h1>
                    <p className="splash-subhead">
                        Lets Connect!
                    </p>
                    <div id="custom-buttom-wrapper">
                        <Link to="/login">
                            <a className="my-super-cool-btn">
                            <div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                            <span className="buttoncooltext">Get Started</span>
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
