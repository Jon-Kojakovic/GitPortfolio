import React from 'react';
import Sidebar from 'react-sidebar';
import * as Styles from "../../constants/styles/styles";
import CustomSidebar from '../../reactComponents/CustomSidebar';
import Footer from "../extra/Footer";

function Contact(){
    return(
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
        <div style={Styles.MainBody}>
            <h1 className="text-4xl font-black text-gray-600">Contact Information</h1>
            <br/>
            <h2 className="text-xl font-black text-gray-500">Personal Information</h2>
                <div className="grid grid-flow-col auto-cols-auto pt-2">
                    <div className="">
                        <p className="pb-2">Phone: +04 781 093</p>
                        <p>E-mail: admin@email.com</p>
                    </div>
                    <div className="col-sm-10 pl-32">
                        <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                        et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                        aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                        officia deserunt mollit anim id est laborum.
                        </p>
                    </div>
                </div>
            <Footer/>
        </div>
        </Sidebar>
    )
}

export default Contact;