/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react';
import { Link } from "react-router-dom";
import * as Styles from '../../constants/styles/styles';
import Footer from '../extra/Footer';
import '../../constants/styles/style.css'
import Sidebar from 'react-sidebar'
import CustomSidebar from '../../reactComponents/CustomSidebar';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth'
import { auth } from '../../../config/firebase'

function Home() {

    const [isAuth, setIsAuth] = useState(false);

    const signUserOut = () => {
        signOut(auth).then(() => {
            localStorage.clear();
            setIsAuth(false);
            window.location.pathname = '/login';
        })
    }

    useEffect(() => {

        const isItAuth = localStorage.getItem('isAuth')

        if (isItAuth) {

            setIsAuth(true);

        }

    })

    return (
        <Sidebar
            docked={true}
            sidebar={
                <CustomSidebar />
            }
            styles={{
                sidebar: {
                    background: "white",
                    width: '15rem',
                    paddingTop: '7rem'
                }
            }}
        >
            <div class="container" style={Styles.MainBody}>
                <div class="row" >
                    <h1 style={Styles.Title}>Vaccination Management for Monroe County</h1>
                </div>
                <div class="row" >
                    <p style={Styles.MainText}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>
                <div className="row">
                    {!isAuth ? (
                        <div className="col-sm-auto align">
                            <button type="button" className="btn btn-primary">
                                <Link to="/login" style={Styles.Link}>Login</Link>
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="col-sm-auto align">
                                <button type="button" className="btn btn-primary" onClick={signUserOut}>
                                    Sign Out
                                </button>
                            </div>
                            <div className="col-sm-auto">
                                <button type="button" className="btn btn-primary">
                                    <Link to="/locations" style={Styles.Link}>Locations</Link>
                                </button>
                            </div>
                            <div className="col-sm-auto">
                                <button type="button" className="btn btn-primary">
                                    <Link to="/patients" style={Styles.Link}>Patients</Link>
                                </button>
                            </div>
                            <div className="col-sm-auto">
                                <button type="button" className="btn btn-primary">
                                    <Link to="/report" style={Styles.Link}>Report</Link>
                                </button>
                            </div>
                            <div className="col-sm-auto">
                                <button type="button" className="btn btn-primary">
                                    <Link to="/schedule" style={Styles.Link}>Schedule</Link>
                                </button>
                            </div>
                            <div className="col-sm-auto">
                                <button type="button" className="btn btn-primary">
                                    <Link to="/maps" style={Styles.Link}>Map</Link>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="col-sm-auto">
                        <button type="button" className="btn btn-primary">
                            <Link to="/booking" style={Styles.Link}>Booking</Link>
                        </button>
                    </div>
                </div>

                <Footer />
            </div>
        </Sidebar>
    )
}

export default Home;