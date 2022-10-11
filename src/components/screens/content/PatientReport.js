import Footer from "../extra/Footer";
import * as Styles from "../../constants/styles/styles";
import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "../../../config/firebase";
import { useNavigate } from "react-router-dom";
import {
    getDocs,
    collection,
    doc,
    updateDoc,
    deleteDoc,
    getDoc
} from "firebase/firestore";
import Sidebar from "react-sidebar";
import CustomSidebar from "../../reactComponents/CustomSidebar";
import moment from "moment";
import DatePicker from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { format } from "date-fns";
import "../../constants/styles/style.css";

function PatientReport() {
    let navigate = useNavigate();

    const [reporting, setReporting] = useState(false);
    const [locationsList, setLocationsList] = useState([]);
    const [patinetsList, setPatientsList] = useState([]);
    const locationsCollectionRef = collection(db, "Locations");
    const [timeslotsList, setTimeslotsList] = useState([]);
    const sideEffectsRef = useRef()
    const HI_companyRef = useRef()
    const insurance_idRef = useRef()
    const [currentLocation, setCurrentLocation] = useState("");
    const [currentTimeslot, setCurrentTimeslot] = useState("");
    const [date, setDate] = useState(new Date());
    //patient object
    const [patient, setPatient] = useState({
        id: '',
        name: '',
        dob: '',
        address: '',
        zip_code: '',
        state: '',
        HI_company: '',
        insurance_id: ''
    })
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

            getLocations();

        }

        handleChange()

        return () => {
            isCancelled = true
        }

    });
    //gets all documents form the locations collection in the database
    const getLocations = async () => {

        const data = await getDocs(locationsCollectionRef);
        setLocationsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

    };
    //gets all the timeslot documents from a specific location
    const getTimeslots = async (locationID) => {
        setTimeslotsList([]);

        setCurrentLocation(locationID);

        const data = await getDocs(
            collection(db, "Locations", locationID, "Timeslots")
        );

        data.docs.map((doc) =>
            setTimeslotsList((timeslotsList) => [
                ...timeslotsList,
                { ...doc.data(), id: doc.id },
            ])
        );
    };
    //gets all patients with appointments on that day
    const getAppointments = async (locationID, timeslotID) => {
        setPatientsList([]);
        //sets the currently selected timeslot
        setCurrentTimeslot(timeslotID);
        //collect all appointment documents from a specific timeslot
        const data = await getDocs(
            collection(
                db,
                "Locations",
                locationID,
                "Timeslots",
                timeslotID,
                "Appointments"
            )
        );

        const today = new Date();

        const formatted = format(today, "yyyy-MM-dd");
        //loops through the appointments
        data.docs.map(async (document) => {

            //checks if the appointments date matches that day
            if (formatted === document.data().date) {

                const snapshot = await getDoc(doc(db, 'Patients', document.data().patient_identifier))

                setPatientsList((patientsList) => [
                    ...patientsList,
                    { ...snapshot.data(), id: snapshot.id, type_of_vaccine: document.data().type_of_vaccine, appointment: document.id }
                ])

            } else {
                return;
            }
        }
        );

    };
    //sets the currently selected appointment
    const reportPatient = async (id, type, appointment) => {

        setReporting(true)

        const patientDoc = doc(db, 'Patients', id)

        const snapshot1 = await getDoc(patientDoc)

        const _patient = snapshot1.data()

        setPatient({
            id: id,
            name: _patient.name,
            type_of_vaccine: type,
            appointment: appointment
        })

    }
    //handle the processing of the appointment
    const handleSubmit = async (locationID, timeslotID) => {

        var side_effects = patient.side_effects

        const patientDoc = doc(db, 'Patients', patient.id)
        //updates the patient document with the new values
        await updateDoc(patientDoc, {
            name: patient.name,
            dob: date.format('YYYY-MM-DD'),
            address: patient.address,
            zip_code: patient.zip_code,
            state: patient.state,
            HI_company: patient.HI_company,
            insurance_id: patient.insurance_id
        })
        //dodges null point exception
        if (side_effects === null) {
            side_effects = ''
        }
        //updates the specific shot document for the patient
        await updateDoc(doc(collection(db, 'Patients', patient.id, 'Shots'), patient.type_of_vaccine), {
            side_effects: side_effects,
            appointment_location: locationID,
            doctor: auth.currentUser.email,
            completed: true
        })

        const doctorDoc = doc(db, 'Users', auth.currentUser.email, 'Locations', locationID)

        var docsTotalProccesed = doctorDoc.total_proccesed
        var docsSideEffects = doctorDoc.total_side_effects

        docsTotalProccesed = docsTotalProccesed + 1

        if (side_effects !== '') {
            docsSideEffects = docsSideEffects + 1
        }
        //tracks the doctors processing of the appointment
        await updateDoc(doctorDoc, {

            total_proccesed: docsTotalProccesed,
            total_side_effects: docsSideEffects

        })

        //deletes the appointment from the database
        const appointmentDoc = doc(db, 'Locations', locationID, 'Timeslots', timeslotID, 'Appointments', patient.appointment)
        await deleteDoc(appointmentDoc)
        //resets the patient object
        setPatient({
            id: '',
            name: '',
            type_of_vaccine: '',
            dob: '',
            address: '',
            zip_code: '',
            state: '',
            side_effects: '',
            HI_company: '',
            insurance_id: ''
        })

        setReporting(false)

    }

    return (
        <Sidebar
            docked={true}
            sidebar={<CustomSidebar />}
            styles={{
                sidebar: {
                    background: "white",
                    width: "15rem",
                    paddingTop: "7rem",
                },
            }}
        >
            <div className="container flex flex-wrap gap-8" style={Styles.MainBody}>
                <div className="flex flex-wrap gap-8 p-4">
                    <table className="border-separate border border-slate-500 bg-white">
                        <thead>
                            <tr>
                                <th className="text-2xl font-black text-gray-500 border border-slate-600 p-2 tracking-wide">
                                    Location
                                </th>
                                <th className="text-2xl font-black text-gray-500 border border-slate-600 p-2 tracking-wide">
                                    Timeslot
                                </th>
                                <th className="text-2xl font-black text-gray-500 border border-slate-600 p-2 tracking-wide">
                                    Appointments
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="list-none">
                                <td className="font-bold text-gray-500 border border-slate-700">
                                    {locationsList.map((location) => {
                                        return (
                                            <div className="align-left p-2">
                                                <button onClick={() => getTimeslots(location.id)}>
                                                    {location.id}
                                                </button>
                                            </div>

                                        );
                                    })}
                                </td>
                                <td className="font-bold text-gray-500 border border-slate-700">
                                    {timeslotsList.map((timeslot) => {
                                        return (
                                            <div className="align-left p-2">
                                                <button
                                                    onClick={() =>
                                                        getAppointments(currentLocation, timeslot.id)
                                                    }
                                                >
                                                    {timeslot.id}
                                                </button>
                                            </div>

                                        );
                                    })}
                                </td>
                                <td className="font-bold text-gray-500 border border-slate-700">
                                    {patinetsList.map((patient) => {
                                        return (
                                            <div className="align-left p-2">
                                                <button
                                                    onClick={() =>
                                                        reportPatient(patient.id, patient.type_of_vaccine, patient.appointment)
                                                    }
                                                >
                                                    {patient.name}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </td>

                            </tr>
                        </tbody>
                    </table>
                </div>
                <br />

                {reporting && <div className='col-sm-5 pb-4 pt-2' style={Styles.ColWide}>
                    <h2 className='row-sm-8 font-black text-gray-500' style={Styles.Title}>
                        {patient.name}
                    </h2>
                    <h4 className='row-sm-8 font-black text-gray-500' style={Styles.Title}>
                        Patient Report
                    </h4>
                    <div className='row-sm-8'>
                        <label htmlFor="timeslot" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Date of Birth</label>
                        <DatePicker timeFormat={false} selected={date}
                            onChange={(date) => setDate(date)} required />
                    </div>
                    <div className='row-sm-8'>
                        <label htmlFor="location" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Address</label>
                        <input type="text" className="form-control" placeholder="Enter..." id="location" ref={sideEffectsRef}
                            onChange={
                                (e) =>
                                    setPatient({ ...patient, address: e.target.value })}
                            required />
                    </div>
                    <div className='row-sm-8'>
                        <label htmlFor="location" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Zip Code</label>
                        <input type="text" className="form-control" placeholder="Enter..." id="location" ref={sideEffectsRef}
                            onChange={
                                (e) =>
                                    setPatient({ ...patient, zip_code: e.target.value })}
                            required />
                    </div>
                    <div className='row-sm-8'>
                        <label htmlFor="location" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>State</label>
                        <input type="text" className="form-control" placeholder="Enter..." id="state" ref={sideEffectsRef}
                            onChange={
                                (e) =>
                                    setPatient({ ...patient, state: e.target.value })}
                            required />
                    </div>
                    <div className='row-sm-8'>
                        <label htmlFor="location" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Adverse Effects</label>
                        <input type="text" className="form-control" placeholder="Enter..." id="side_effects" ref={sideEffectsRef}
                            onChange={
                                (e) =>
                                    setPatient({ ...patient, side_effects: e.target.value })}
                            required />
                    </div>
                    <div className='row-sm-8'>
                        <label htmlFor="timeslot" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Health Insurance Company</label>
                        <input type="text" className="form-control" placeholder="Enter..." id="timeslot" ref={HI_companyRef}
                            onChange={(e) =>
                                setPatient({ ...patient, HI_company: e.target.value })}
                            required />
                    </div>
                    <div className='row-sm-8'>
                        <label htmlFor="timeslot" className="font-black text-gray-300 py-2" style={Styles.Subtitle}>Insurance ID</label>
                        <input type="text" className="form-control" placeholder="Enter..." id="timeslot" ref={insurance_idRef}
                            onChange={(e) =>
                                setPatient({ ...patient, insurance_id: e.target.value })}
                            required />
                    </div>
                    <div className="col-sm-auto">
                        <button type="button" onClick={() => handleSubmit(currentLocation, currentTimeslot)} className="btn btn-primary bg-blue-500">
                            Submit
                        </button>
                    </div>
                </div>
                }
                <Footer />
            </div>
        </Sidebar>
    );
}

export default PatientReport;