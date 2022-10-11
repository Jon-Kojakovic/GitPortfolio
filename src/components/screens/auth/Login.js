import Footer from '../extra/Footer';
import React, { useEffect, useRef, useState } from 'react'
import { auth } from '../../../config/firebase'
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import Sidebar from 'react-sidebar'
import * as Styles from '../../constants/styles/styles';
import CustomSidebar from '../../reactComponents/CustomSidebar';

const Login = () => {

    let navigate = useNavigate();

    const emailRef = useRef()
    const passwordRef = useRef()

    const [error, setError] = useState('')

    var CryptoJS = require("crypto-js");

    //Function used in combonation with the handleChange const to add a delay to how many time the useEffect code happens.
    //Currently set to 5 seconds because if this code isnt present the code is enacted upwards of 10 times per second
    //Without this the code burns through database reads to quickly and costly

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    useEffect(() => {

        let isCancelled = false
        const handleChange = async () => {

            //Redirect to the booking page if there is a user currently logged in

            if (auth.currentUser != null) {
                navigate("/booking")
            }

            await timeout(5000)

            //Retrieves a list of all the User documents from the database

        }

        handleChange()

        return () => {
            isCancelled = true
        }

    })

    //Logs user into firebase account using email andd password
    //Used for staff and admin accounts to securely login and distinguish themselves from...
    //...ordinary users

    const credentialLogin = async (event) => {

        event.preventDefault();
        auth.signOut()

        try {

            setError('')

            await signInWithEmailAndPassword(auth, emailRef.current.value, passwordRef.current.value)
                .then(() => {
                    const hashed = CryptoJS.AES.encrypt(passwordRef.current.value, 'secretkey 321').toString()
                    localStorage.setItem('value', hashed)
                    navigate('/booking');
                })
        } catch {
            setError('Username or password is incorrect!')
        }

    }

    //Anonymous login for average citizen

    const signInAnonymouslyMethod = (event) => {

        event.preventDefault();
        auth.signOut()

        signInAnonymously(auth).then(() => {
            navigate('/booking');
        })

    }

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
            <div className="container" style={Styles.MainBody}>
                <div className="row" >
                    <h1 style={Styles.Title} className="text-4xl font-black text-gray-600">Login</h1>
                </div>
                <br />
                <div className="row g-2">
                    {error && <Alert variant='danger'>{error}</Alert>}
                    <form onSubmit={credentialLogin} >
                        <div className='col-sm-4'>
                            <label htmlFor="mail" className="form-label font-black text-gray-500 py-2">Email address</label>
                            <input type="email" className="form-control"
                                placeholder="Email" id="mail" ref={emailRef} equired />
                        </div>
                        <div className='col-sm-4 pb-4'>
                            <label htmlFor="password" className="font-black text-gray-500 py-2">Password</label>
                            <input type="password" className="form-control" placeholder="Password" ref={passwordRef} required />
                        </div>
                        <br />
                        <div className="flex">
                            <div className="col-sm-auto pr-16">
                                <button type="submit" className="btn btn-primary bg-blue-500 font-semibold">
                                    LOGIN
                                </button>
                            </div>
                            <div className="col-sm-auto">
                                <button className="btn btn-primary bg-blue-500 font-semibold" onClick={(e) => signInAnonymouslyMethod(e)}>
                                    SIGN IN AS GUEST
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <Footer />
            </div>
        </Sidebar>
    )
}

export default Login;

