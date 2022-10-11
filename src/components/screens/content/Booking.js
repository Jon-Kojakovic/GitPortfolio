import Footer from '../extra/Footer';
import * as Styles from '../../constants/styles/styles';
import React, { useEffect, useRef, useState } from 'react'
import { auth, db } from '../../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, setDoc, doc } from 'firebase/firestore'
import Sidebar from 'react-sidebar';
import CustomSidebar from '../../reactComponents/CustomSidebar';
import moment from 'moment';
import DatePicker from 'react-datetime';
import "react-datetime/css/react-datetime.css";

const Booking = () => {

    let navigate = useNavigate();

    const fullNameRef = useRef()
    const type_of_vaccineRef = useRef()
    const batchRef = useRef()
    const HI_companyRef = useRef()
    const insurance_idRef = useRef()
    const emailRef = useRef()
    const phone_numberRef = useRef()

    const [locationsList, setLocationsList] = useState([]);
    const [vaccinesList, setVaccinesList] = useState([]);
    const [availableTimeslots, setAvailableTimeslots] = useState([]);
    const locationsCollectionRef = collection(db, 'Locations')
    const vaccinesCollectionRef = collection(db, 'Vaccines')
    const [chosenLocation, setChosenLocation] = useState('')
    const [date, setDate] = useState(new Date());
    var badDateTrigger = false
    var trigger = 0

    //Timeout function that stops the page from burning through reads by delaying all functions in...
    //...the useEffect() by 5 seconds

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    useEffect(() => {

        let isCancelled = false
        const handleChange = async () => {
            //Checks if a user is logged in and redirects the to the login page if not
            if (auth.currentUser == null) {
                navigate("/login")
            }

            await timeout(5000)

            //collects all documents in the Locations collection from the database

            const getLocations = async () => {

                const data = await getDocs(locationsCollectionRef)
                setLocationsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

            }

            //collects all documents in the Vaccines collection from the database

            const getVaccines = async () => {

                const data = await getDocs(vaccinesCollectionRef)
                setVaccinesList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

            }

            getLocations();

            getVaccines();

        }

        handleChange()

        return () => {
            isCancelled = true
        }

    })

    //Sets the currently selected location

    const chosenLoc = async () => {

        var current = document.getElementById('location').value

        setLocation({ ...location, location_name: current })

        setChosenLocation(current)

    }

    //changes the date on the date picker and calls a method that collects the unavailable dates 

    const changeDate = (newDate) => {
        setDate(newDate)

        getUnavailableDates(newDate)
    }

    //creates unique id for the patients document
    function getRandomString(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }

    //set a list of timeslots that are available on the chosen date

    const getUnavailableDates = async (newDate) => {

        //resets useStates
        setAvailableTimeslots([])
        var timeslotList = ''

        //collects all timeslots in the currently selected location
        timeslotList = await getDocs(collection(db, 'Locations', chosenLocation, 'Timeslots'))

        //loops through all the timeslots
        timeslotList.docs.map(async (timeslot) => {

            trigger = 0

            var unavailableDocs = ''

            //gets all Unavailable dates documents from the specific timeslot
            unavailableDocs = await getDocs(collection(db, 'Locations', chosenLocation, 'Timeslots', timeslot.id, 'Unavailable Dates'))
            //loops through all the unavailable dates
            unavailableDocs.docs.map((doc) => {

                const data = doc.data()

                const formattedNewDate = newDate.format('YYYY-MM-DD')
                //checks if the surrently selected date is teh same as the specific unavailable date
                if (data.date === formattedNewDate) {

                    badDateTrigger = true

                    trigger = -9999

                }

                trigger = trigger + 1

            })
            //disables a timeslot if it coencides with an unavailable date
            if ((badDateTrigger === false) && trigger > 0) {

                setAvailableTimeslots((availableTimeslots) => [
                    ...availableTimeslots,
                    timeslot
                ])

            } else {
                badDateTrigger = false
            }

        })

    }
    //patient object
    const [patient, setPatient] = useState({
        name: '',
        HI_company: '',
        insurance_id: '',
        side_effects: '',
        email: '',
        phone_number: ''
    })
    //location object
    const [location, setLocation] = useState({
        location_name: '',
        timeslot: '',
        patient_identifier: '',
        type_of_vaccine: '',
        batch: '',
        date: ''
    })
    //handles the booking submition
    const handleSubmit = async (e) => {

        e.preventDefault();

        const patientIdentifier = getRandomString(9)
        const patientsRef = collection(db, 'Patients')
        //creates an empty appointment document in a specific timeslot
        const appointmentsRef = doc(collection(db, 'Locations', location.location_name, 'Timeslots', location.timeslot, 'Appointments'));
        //creates a new patient document in the database
        await setDoc(doc(patientsRef, patientIdentifier), {
            name: patient.name,
            dob: '',
            address: '',
            zip_code: '',
            state: '',
            HI_company: patient.HI_company,
            insurance_id: patient.insurance_id,
            email: patient.email,
            phone_number: patient.phone_number,
            patient_identifier: patientIdentifier
        })
        //creates a new shot document in a specific patients document
        //creates a new shot collection too if there is not one already existing
        await setDoc(doc(collection(db, 'Patients', patientIdentifier, 'Shots'), patient.type_of_vaccine), {
            type_of_vaccine: patient.type_of_vaccine,
            batch: patient.batch,
            date: date.format('YYYY-MM-DD'),
            side_effects: '',
            doctor: auth.currentUser.email,
            appointment_location: location.location_name,
            completed: false
        })
        //sets the value of the empty appointment document
        await setDoc(appointmentsRef, {
            patient_identifier: patientIdentifier,
            type_of_vaccine: patient.type_of_vaccine,
            name: patient.name,
            date: date.format('YYYY-MM-DD')
        })
        //resets the patient object
        setPatient({
            name: '',
            HI_company: '',
            insurance_id: '',
            side_effects: '',
            email: '',
            phone_number: '',
            patient_identifier: ''
        })
        //resets the location object
        setLocation({
            location_name: '',
            type_of_vaccine: '',
            batch: '',
            timeslot: '',
            date: ''
        })
        setDate(new Date())

        //reset the form values
        document.getElementById('name').value = ''
        document.getElementById('location').value = ''
        document.getElementById('timeslots').value = ''
        document.getElementById('batch').value = ''
        document.getElementById('typeOfVaccine').value = ''
        document.getElementById('HICompany').value = ''
        document.getElementById('insurance').value = ''
        document.getElementById('email').value = ''
        document.getElementById('phoneNumber').value = ''

    }
    //page contents
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
                    <h1 style={Styles.Title} className="text-4xl font-black text-gray-600">Vaccination Booking</h1>
                </div>
                <br />
                <div className="row">
                    <form className='row' onSubmit={handleSubmit}>
                        <div className='col-sm-5 justify-content-around pb-4 pt-2' style={Styles.ColWide}>
                            <h4 className='font-black text-gray-500' style={Styles.Title}>
                                Personal Information
                            </h4>
                            <div className='row-sm-8'>
                                <label htmlFor="name" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Full Name</label>
                                <input type="text" className="form-control"
                                    placeholder="Enter..." id="name" ref={fullNameRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, name: e.target.value })} required />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="email" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Contact Email</label>
                                <input type="email" className="form-control" placeholder="Enter..." id="email" ref={emailRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, email: e.target.value })} />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="phone_number" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Contact Number</label>
                                <input type="text" className="form-control" placeholder="Enter..." id="phoneNumber" ref={phone_numberRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, phone_number: e.target.value })} />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="HI_company" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Insurance Provider</label>
                                <input type="text" className="form-control" placeholder="Enter..." id="HICompany" ref={HI_companyRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, HI_company: e.target.value })} required />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="insurance_id" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Insurance ID</label>
                                <input type="text" className="form-control" placeholder="Enter..." id="insurance" ref={insurance_idRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, insurance_id: e.target.value })} required />
                            </div>
                        </div>

                        <div className='row-sm-8 pb-4 pt-2' style={Styles.ColWide}>
                            <h4 className="font-black text-gray-500" style={Styles.Title}>
                                Vaccine Information
                            </h4>
                            <div className='row-sm-8'>
                                <label htmlFor="type_of_vaccine" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Vaccine Dose</label>
                                <select type="text" className="form-control" placeholder="Enter..." id="typeOfVaccine" ref={type_of_vaccineRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, type_of_vaccine: e.target.value })} required>
                                    <option value=''></option>
                                    <option value='Immunization 1'>Immunization 1</option>
                                    <option value='Immunization 2'>Immunization 2</option>
                                    <option value='Booster 1'>Booster 1</option>
                                    <option value='Booster 2'>Booster 2</option>
                                    <option value='Booster 3'>Booster 3</option>
                                </select>
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="batch" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Vaccine Brand</label>
                                <select className="form-control" type="text" id="batch" placeholder="Batch" ref={batchRef}
                                    onChange={(e) =>
                                        setPatient({ ...patient, batch: e.target.value })} required>
                                    <option value=''></option>
                                    {
                                        // displays all vaccines in the database
                                        vaccinesList.map((vaccine) => {

                                            return (<option value={vaccine.id}>{vaccine.id}</option>)

                                        })
                                    }
                                </select>
                            </div>
                        </div>

                        <div className='col-sm-5 pb-4 pt-2' style={Styles.ColWide}>
                            <h4 className='row-sm-8 font-black text-gray-500' style={Styles.Title}>
                                Venue Information
                            </h4>
                            <div className='row-sm-8'>
                                <label htmlFor="location" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Venue</label>
                                <select className="form-control" type="text" id="location" placeholder="Location"
                                    onChange={((e) => chosenLoc(e))} required>
                                    <option value=''></option>
                                    {
                                        // displays all locations in the database
                                        locationsList.map((loc) => {

                                            return (<option value={loc.id}>{loc.id}</option>)

                                        })
                                    }
                                </select>
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="timeslot" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Date</label>
                                <DatePicker timeFormat={false} selected={date} onChange={((date) => changeDate(date))} required />
                            </div>
                            <div className='row-sm-8'>
                                <label htmlFor="timeslot" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Timeslot</label>
                                <select className="form-control" type="text" id="timeslots" placeholder="Timeslots"
                                    onChange={(e) => setLocation({ ...location, timeslot: e.target.value })} required>
                                    <option value=''></option>
                                    {
                                        // displays all available timeslots for the location
                                        availableTimeslots.map((time) => {

                                            return (<option value={time.id}>{time.id}</option>)

                                        })
                                    }
                                </select>
                            </div>
                        </div>

                        <br />
                        <div className="col-sm-auto">
                            <button type="submit" className="btn btn-primary bg-blue-500 font-semibold">
                                BOOK APPOINTMENT
                            </button>
                        </div>
                    </form>
                </div>
                <Footer />
            </div>
        </Sidebar>
    )
}

export default Booking;