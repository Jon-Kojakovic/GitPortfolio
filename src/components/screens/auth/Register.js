import React, { useEffect, useState } from 'react'
import Footer from '../extra/Footer';
import { Card } from "react-bootstrap";
import * as Styles from '../../constants/styles/styles';
import { auth, db } from '../../../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, getDocs, collection, doc } from 'firebase/firestore';
import Sidebar from 'react-sidebar';
import CustomSidebar from '../../reactComponents/CustomSidebar';

const Register = () => {

    var CryptoJS = require("crypto-js");
    const [loading, setLoading] = useState(true)
    const [usersList, setUsersList] = useState([])
    const [locationsList, setLocationsList] = useState([])
    //form object
    const [form, setForm] = useState({
        email: '',
        password: '',
        role: ''
    })
    //Timeout function that stops the page from burning through reads by delaying all functions in...
    //...the useEffect() by 5 seconds
    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }


    useEffect(() => {

        let isCancelled = false
        const handleChange = async () => {

            await timeout(5000)
            //collects all documents from the locations collection in the database
            const getLocations = async () => {
                var data = await getDocs(collection(db, 'Locations'))
                setLocationsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            }
            //collects all documents from the Users collection in the database
            const getUsers = async () => {
                const data = await getDocs(collection(db, 'Users'))
                setUsersList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            }

            getLocations()
            getUsers()

            setLoading(false)

        }

        handleChange()

        return () => {
            isCancelled = true
        }


    })

    //handle the creation of a new firebase account
    const handleSubmit = async (e) => {
        e.preventDefault();
        //setts the current admins credentials
        const adminEmail = auth.currentUser.email
        const hashedAdminPassword = localStorage.getItem('value')
        const bytes = CryptoJS.AES.decrypt(hashedAdminPassword, 'secretkey 321')
        const adminPassword = bytes.toString(CryptoJS.enc.Utf8);

        //creates a new firebase user with given credentials
        createUserWithEmailAndPassword(auth, form.email, form.password)
            .then(async () => {

                //creates a new user document
                await setDoc(doc(collection(db, 'Users'), form.email), {
                    username: form.email,
                    role: form.role
                })

                locationsList.map(async (location) => {

                    await setDoc(doc(collection(db, 'Users', form.email, 'Locations'), location.id), {
                        total_proccesed: 0,
                        total_side_effects: 0
                    })

                })

                document.getElementById('email').value = ''
                document.getElementById('password').value = ''
                document.getElementById('role').value = ''

                auth.signOut()
                await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
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
                    <h1 style={Styles.Title} className="text-4xl font-black text-gray-600">Register</h1>
                </div>
                <br />
                <div className="row g-2">
                    <form onSubmit={handleSubmit} >
                        <div className='col-sm-4'>
                            <label htmlFor="mail" className="form-label font-black text-gray-500">Email address</label>
                            <input type="email" className="form-control"
                                placeholder="Email" id="mail"
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className='col-sm-4'>
                            <label htmlFor="password" className="font-black text-gray-500">Password</label>
                            <input type="password" className="form-control" id='password' placeholder="Password"
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div className='col-sm-4'>
                            <label htmlFor="role" className="font-black text-gray-500">Role</label>
                            <select type='text' className='form-control' id='role'
                                onChange={(e) =>
                                    setForm({ ...form, role: e.target.value })}>
                                <option value=''></option>
                                <option value='admin'>Admin</option>
                                <option value='staff'>Staff</option>
                            </select>
                        </div>
                        <br />
                        <div className="col-sm-auto">
                            <button type="submit" className="btn btn-primary bg-blue-500 font-semibold" disabled={loading}>
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
                {/* lists all user documents in the database */}
                {usersList.map((account) => {
                    return (
                        <Card style={Styles.CardContainer}>
                            <Card.Body>
                                <Card.Title >{account.role}</Card.Title>
                                <Card.Text style={Styles.CardLink}>{account.username}</Card.Text>
                            </Card.Body>
                        </Card>
                    )
                })}
                <Footer />
            </div>
        </Sidebar>

    )
}

export default Register
