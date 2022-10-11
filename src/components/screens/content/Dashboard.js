import React, { useState } from 'react'
import { login } from '../../../config/auth'
import Footer from '../extra/Footer';
import * as Styles from '../../constants/styles/styles';
import BookingCard from '../../reactComponents/BookingCard';
import CustomSidebar from '../../reactComponents/CustomSidebar';
import Sidebar from 'react-sidebar'

const Dashboard = () => {

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
                    <h1 style={Styles.Title}>Booked Appointments</h1>
                </div>
                <br />
                <div class="row g-2">
                    <BookingCard name='John Doe' vaxType='Pfizer' vaxDose='1' bookDate='06/02/2022' />
                </div>
                <Footer />
            </div>
        </Sidebar>
    )
}

export default Dashboard;
