import { Link } from 'react-router-dom';
import { Card, ListGroup } from 'react-bootstrap';
import { auth, db } from '../../config/firebase'
import * as Styles from '../constants/styles/styles';
import '../constants/styles/style.css';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';

//This is the sidebar component which functions as the sites navigation system

function CustomSidebar() {

    const [initLoader, setInitLoader] = useState(true)
    const [userRole, setUserRole] = useState()

    useEffect(() => {

        let isCancelled = false
        const handleChange = async () => {

            if (initLoader) {

                //constant that retrieves the current logged in users email

                var email = auth.currentUser.email

                //collects all documents froom the Users collection in the database

                const data = await getDocs(collection(db, "Users"))
                data.docs.map((doc) => {

                    //sets the current users role to their role assinged in the database

                    if (email === doc.data().username) {
                        setUserRole(doc.data().role)
                    }

                })

                //variable that stops the useEffect code from activating after the 1st time
                setInitLoader(false)

            }

        }

        handleChange()

        return () => {
            isCancelled = true
        }

    })
    //The sidebar object
    return (
        <Card>
            <ListGroup variant="flush">
                {auth.currentUser ?
                    (
                        //Navigation content visible to all roles
                        <div>
                            <div className="py-2">
                                <div>
                                    <ListGroup.Item className={Styles.LinkStyling} onClick={() => auth.signOut()}>SIGN OUT</ListGroup.Item>
                                </div>
                            </div>
                            <div className="pb-2">
                                <Link to="/booking">
                                    <ListGroup.Item className={Styles.LinkStyling}>BOOK APPOINTMENT</ListGroup.Item>
                                </Link>
                            </div>
                            <div className="pb-2">
                                <Link to="/maps">
                                    <ListGroup.Item className={Styles.LinkStyling}>MAP</ListGroup.Item>
                                </Link>
                            </div>
                            <div>
                                <Link to="/contact">
                                    <ListGroup.Item className={Styles.LinkStyling}>CONTACT</ListGroup.Item>
                                </Link>
                            </div>
                        </div>
                    )
                    :
                    [
                        <Link to="/login" className="pb-2">
                            <ListGroup.Item className={Styles.LinkStyling}>LOGIN</ListGroup.Item>
                        </Link>
                    ]
                }
                {/* navigation content visible only to staff and admin roles */}
                {((userRole === 'staff') || (userRole === 'admin')) &&
                    <div>
                        <div className="py-2">
                            <Link to="/schedule">
                                <ListGroup.Item className={Styles.LinkStyling}>SCHEDULE</ListGroup.Item>
                            </Link>
                        </div>
                        <div>
                            <Link to="/patientreport">
                                <ListGroup.Item className={Styles.LinkStyling}>PATIENT REPORT</ListGroup.Item>
                            </Link>
                        </div>
                    </div>
                }
                {/* navigation content visible only to admin roles */}
                {(userRole === 'admin') &&
                    <div>
                        <div className="py-2">
                            <Link to="/report">
                                <ListGroup.Item className={Styles.LinkStyling}>DATA REPORT</ListGroup.Item>
                            </Link>
                        </div>
                        <div className="pb-2">
                            <Link to="/locations">
                                <ListGroup.Item className={Styles.LinkStyling}>LOCATIONS</ListGroup.Item>
                            </Link>
                        </div>
                        <div className="pb-2">
                            <Link to="/patients">
                                <ListGroup.Item className={Styles.LinkStyling}>PATIENTS</ListGroup.Item>
                            </Link>
                        </div>
                        <div>
                            <Link to="/register">
                                <ListGroup.Item className={Styles.LinkStyling}>ACCOUNTS</ListGroup.Item>
                            </Link>
                        </div>
                    </div>
                }
            </ListGroup>
        </Card >
    )
}

export default CustomSidebar;