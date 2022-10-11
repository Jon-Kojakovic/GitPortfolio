import React, { useState, useEffect } from "react";
import Footer from "../extra/Footer";
import * as Styles from "../../constants/styles/styles";
import Sidebar from 'react-sidebar';
import CustomSidebar from '../../reactComponents/CustomSidebar';
import '../../constants/styles/style.css';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import DatePicker from "react-datetime";
import "react-datetime/css/react-datetime.css";
import "../../constants/styles/style.css";
import SideEffectsReportCard from "../../reactComponents/reportCard/SideEffectsReportCard";
import LocationReportCard from "../../reactComponents/reportCard/LocationReportCard";
import EmployeeReportCard from "../../reactComponents/reportCard/EmployeeReportCard";


function ReportPage() {

  let navigate = useNavigate();

  const [patientsList, setPatientsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [docsList, setDocsList] = useState([]);
  const [empLocsList, setEmpLocsList] = useState([]);
  const [_docsList, _setDocsList] = useState([]);
  const [adverseList, setAdverseList] = useState([]);
  const [loading, setLoading] = useState(true)
  const [byLocationSelected, setByLocationSelected] = useState(false)
  const [byEmployeeSelected, setByEmployeeSelected] = useState(false)
  const [adverseReactionSelected, setAdverseReactionSelected] = useState(false)
  const [specificDateSelected, setSpecificDateSelected] = useState(false)
  const [locationSelected, setLocationSelected] = useState(false)
  const [employeeSelected, setEmployeeSelected] = useState(false)
  const [employeeLocationSelected, setEmployeeLocationSelected] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [submittedSE, setSubmittedSE] = useState(false)
  const [submittedE, setSubmittedE] = useState(false)
  const [submittedL, setSubmittedL] = useState(false)
  //Side effects card object
  const [sec, setSEC] = useState({
    date: '',
    patientName: '',
    type_of_vaccine: '',
    doctor: '',
    manufacturer: '',
    brand: '',
    batch: '',
    side_effects: ''
  })
  //location card object
  const [lc, setLC] = useState({
    totalProccesed: '',
    totalModerna: '',
    totalPfizer: '',
    totalJnJ: '',
    totalAstrozeneka: '',
    totalNewVaccine: '',
    totalImm1: '',
    totalImm2: '',
    totalBooster1: '',
    totalBooster2: '',
    totalBooster3: '',
    totalUnknown: '',
    totalSideEffects: ''
  })
  //employee card object
  const [ec, setEC] = useState({
    employee: '',
    location: '',
    total_proccesed: '',
    total_side_effects: ''
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

      //collects all documents from the Patients, Users and Locations collections in the database
      var data = await getDocs(collection(db, 'Patients'))
      setPatientsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      data = await getDocs(collection(db, 'Users'))
      setUsersList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      data = await getDocs(collection(db, 'Locations'))
      setLocationsList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      setLoading(false)

    }

    handleChange()

    return () => {
      isCancelled = true
    }


  })

  //sets which form of data report is choosen
  const changeDataReport = async () => {

    var choice = document.getElementById('dataReport').value
    //reseting key values
    setAdverseList([])
    setSpecificDateSelected(false)
    setLocationSelected(false)
    setDisabled(true)
    setEmployeeSelected(false)
    setSubmittedSE(false)
    setSubmittedE(false)
    setSubmittedL(false)
    setEmployeeLocationSelected(false)

    //dynamically creates the nest part of the data report hierarchy
    if (choice === 'By Location') {

      setByLocationSelected(true)
      setByEmployeeSelected(false)
      setAdverseReactionSelected(false)


    }
    else if (choice === 'By Employee') {

      setByLocationSelected(false)
      setByEmployeeSelected(true)
      setAdverseReactionSelected(false)

    }
    else if (choice === 'Adverse Reaction Report') {

      setByLocationSelected(false)
      setByEmployeeSelected(false)
      setAdverseReactionSelected(true)

      patientsList.map(async (patient) => {
        //list all patients who suffered side effects
        const q = await getDocs(query(collection(db, 'Patients', patient.id, 'Shots'), where('side_effects', "!=", '')));

        q.docs.map((doc) => {

          setAdverseList((docsList) => [
            ...docsList,
            { ...doc.data(), id: doc.id, patient_id: patient.id, patient_name: patient.name }
          ])

        });
      })

    }
  }
  //sets the location for the "By Location" data report
  const changeLocation = async () => {
    //resets key values
    setDocsList([])
    setSpecificDateSelected(false)
    setLocationSelected(true)
    const locationID = document.getElementById('location').value

    if (document.getElementById('timeframe') !== null) {
      document.getElementById('timeframe').value = ''
    }

    patientsList.map(async (patient) => {

      //collects a list of all patients who had an appointment scheduled in a specific location 
      const q = await getDocs(query(collection(db, 'Patients', patient.id, 'Shots'), where('appointment_location', "==", locationID)));

      q.docs.map((doc) => {

        if (doc.data().completed === true) {

          setDocsList((docsList) => [
            ...docsList,
            { ...doc.data(), id: doc.id }
          ])

        }
      }
      );
    })
  }
  //changes who the current employee is for the "By Employee" data report option
  const changeEmployee = async () => {

    setEmpLocsList([])

    const employeeID = document.getElementById('employee').value

    const q = await getDocs(collection(db, 'Users', employeeID, 'Locations'));

    q.docs.map((doc) => {

      setEmpLocsList((docsList) => [
        ...docsList,
        { ...doc.data(), id: doc.id }
      ])

    }
    );

    setEmployeeSelected(true)
    setDisabled(false)

  }
  //changes the timeframe within which to search for the data report
  const changeTimeframe = () => {

    _setDocsList([])

    var choice = document.getElementById('timeframe').value

    //brings up a date picker to chose a specific date 
    if (choice === 'Specific Date') {

      setSpecificDateSelected(true)
      setDisabled(true)

    }
    //collects all patients whos appointment was processed within the last month
    else if (choice === 'Month') {

      docsList.map(async (docer) => {

        var docDate = new Date(docer.date)

        var today = new Date()

        console.log(today)

        var monthAgo = today

        monthAgo.setMonth(monthAgo.getMonth() - 1)

        if (monthAgo <= docDate) {

          _setDocsList((_docsList) => [
            ..._docsList,
            { ...docer }
          ])

        }
      })

      setDisabled(false)

    }
    //collects all patients whos appointment was processed within the last week
    else if (choice === 'Week') {

      docsList.map(async (docer) => {

        var docDate = new Date(docer.date)

        var today = new Date()

        var weekAgo = today

        if (weekAgo.getDay() < 8) {

          weekAgo.setDate(weekAgo.getDay() - 7)

        }
        else {

          weekAgo.setDate(weekAgo.getDay() - 7)

        }

        if (weekAgo <= docDate) {

          _setDocsList((_docsList) => [
            ..._docsList,
            { ...docer }
          ])

        }

      })

      setDisabled(false)

    }


  }
  //sets the currently selected date and preps the next part of the "By Location" data report
  const changeSpecificDate = (date) => {

    getSpecificDateInfo(date)

  }
  //collects all patients whos appointment was processed up until the specific selected date
  const getSpecificDateInfo = async (date) => {

    var formatted = date.format('YYYY-MM-DD')

    var specificFormatted = new Date(formatted)

    docsList.map(async (docer) => {

      var docDate = new Date(docer.date)

      if (specificFormatted <= docDate) {

        _setDocsList((_docsList) => [
          ..._docsList,
          { ...docer }
        ])

      }

    })

    setDisabled(false)

  }

  //handles the "By Location" data report logic
  const byLocation = async (e) => {

    e.preventDefault()

    var totalProccesed = 0
    var totalModerna = 0
    var totalPfizer = 0
    var totalJnJ = 0
    var totalAstrozeneka = 0
    var totalNewVaccine = 0
    var totalBooster1 = 0
    var totalBooster2 = 0
    var totalBooster3 = 0
    var totalImm1 = 0
    var totalImm2 = 0
    var totalUnknown = 0
    var totalSideEffects = 0

    _docsList.map((doc) => {

      totalProccesed = totalProccesed + 1;

      switch (doc.batch) {
        case 'Moderna':
          (totalModerna = totalModerna + 1)
          break;
        case 'Pfizer':
          (totalPfizer = totalPfizer + 1)
          break;
        case 'J&J':
          (totalJnJ = totalJnJ + 1)
          break;
        case 'Astrozeneka':
          (totalAstrozeneka = totalAstrozeneka + 1)
          break;
        case 'New Vaccine':
          (totalNewVaccine = totalNewVaccine + 1)
          break;
      }

      switch (doc.type_of_vaccine) {
        case 'Immunization 1':
          (totalImm1 = totalImm1 + 1)
          break;
        case 'Immunization 2':
          (totalImm2 = totalImm2 + 1)
          break;
        case 'Booster 1':
          (totalBooster1 = totalBooster1 + 1)
          break;
        case 'Booster 2':
          (totalBooster2 = totalBooster2 + 1)
          break;
        case 'Booster 3':
          (totalBooster3 = totalBooster3 + 1)
          break;
        case 'Unknown':
          (totalUnknown = totalUnknown + 1)
          break;
      }

      if (doc.side_effects !== '') {
        totalSideEffects = totalSideEffects + 1
      }

    });
    //resets the location card object
    setLC({
      total_proccesed: totalProccesed,
      totalModerna: totalModerna,
      totalPfizer: totalPfizer,
      totalJnJ: totalJnJ,
      totalAstrozeneka: totalAstrozeneka,
      totalNewVaccine: totalNewVaccine,
      totalImm1: totalImm1,
      totalImm2: totalImm2,
      totalBooster1: totalBooster1,
      totalBooster2: totalBooster2,
      totalBooster3: totalBooster3,
      totalUnknown: totalUnknown,
      totalSideEffects: totalSideEffects
    })

    setSubmittedL(true)

  }
  //handles the "By Employee" data report logic
  const byEmployee = async (e) => {

    e.preventDefault()

    const employee = document.getElementById('employee').value
    const location = document.getElementById('empLocation').value

    const locationSnap = await getDoc(doc(db, 'Users', employee, 'Locations', location))
    const locationInfo = locationSnap.data()
    //resets the employee card object
    setEC({
      employee: employee,
      location: location,
      total_proccesed: locationInfo.total_proccesed,
      total_side_effects: locationInfo.total_side_effects
    })

    setSubmittedE(true)

  }
  //handles the "Adverse Effects" data report logic
  const byAdverseEffects = async (e) => {

    e.preventDefault()

    const adverseValue = document.getElementById('adverse').value

    const split = adverseValue.split(',')

    const shotID = split[0]
    const patientID = split[1]

    const q1 = await getDoc(doc(db, 'Patients', patientID, 'Shots', shotID));
    const q2 = await getDoc(doc(db, 'Patients', patientID));

    const data = q1.data()
    const patientName = q2.data().name

    const q3 = await getDoc(doc(db, 'Vaccines', data.batch));
    const vaccineInfo = q3.data()

    //sets the side effects object
    setSEC({
      date: data.date,
      patientName: patientName,
      type_of_vaccine: data.type_of_vaccine,
      doctor: data.doctor,
      manufacturer: vaccineInfo.manufacturer,
      brand: vaccineInfo.brand,
      batch: vaccineInfo.batch,
      side_effects: data.side_effects
    })

    setSubmittedSE(true)

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
        <h1 className="text-4xl font-black text-gray-600">Data Report</h1>
        <br />
        <div className="row">
          <div className="col-6">
            <form>
              <div className="col-sm-8">
                <label htmlFor="mail" className="form-label font-black text-gray-500">Data Report</label>
                <select className="form-control" type="text" id="dataReport" name="dataReport" placeholder="Data Report" onChange={changeDataReport} disabled={loading}>
                  <option value=''></option>
                  <option value="By Location">By Location</option>
                  <option value="By Employee">By Employee</option>
                  <option value="Adverse Reaction Report">Adverse Reaction Report</option>
                </select>
              </div>
              {byLocationSelected && <div className="col-sm-8">
                <label htmlFor="mail" className="form-label font-black text-gray-500">Venue</label>
                <select className="form-control" type="text" id="location" name="location" placeholder="Venue" onChange={() => changeLocation()} disabled={loading}>
                  <option value=''></option>
                  {
                    locationsList.map((location) => {

                      return (<option value={location.id}>{location.id}</option>)

                    })
                  }
                </select>
              </div>}
              {byEmployeeSelected && <div className="col-sm-8">
                <label htmlFor="mail" className="form-label font-black text-gray-500">Employee</label>
                <select className="form-control" type="text" id="employee" name="employee" placeholder="Employee" onChange={changeEmployee} disabled={loading}>
                  <option value=''></option>
                  {
                    usersList.map((staff) => {

                      return (<option value={staff.id}>{staff.id}</option>)

                    })
                  }
                </select>
              </div>}
              {employeeSelected && <div className="col-sm-8">
                <label htmlFor="mail" className="form-label font-black text-gray-500">Location</label>
                <select className="form-control" type="text" id="empLocation" name="empLocation" placeholder="Employee" onChange={() => setEmployeeLocationSelected(true)} disabled={loading}>
                  <option value=''></option>
                  {
                    empLocsList.map((loc) => {

                      return (<option value={loc.id}>{loc.id}</option>)

                    })
                  }
                </select>
              </div>}
              {adverseReactionSelected && <div className="col-sm-8">
                <label htmlFor="mail" className="form-label font-black text-gray-500">Patient</label>
                <select className="form-control" type="text" id="adverse" name="adverse" placeholder="Adverse Reaction" onChange={() => setDisabled(false)} disabled={loading}>
                  <option value=''></option>
                  {
                    adverseList.map((effect) => {

                      return (<option value={effect.id + ',' + effect.patient_id}>{effect.patient_name}</option>)

                    })
                  }
                </select>
              </div>}
              {locationSelected && <div className="col-sm-8">
                <label htmlFor="mail" className="form-label font-black text-gray-500">Timeframe</label>
                <select className="form-control" type="text" id="timeframe" name="timeframe" placeholder="Timeframe" onChange={() => changeTimeframe()} disabled={loading}>
                  <option value=''></option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Specific Date">Till specific date</option>
                </select>
                {specificDateSelected && <DatePicker timeFormat={false}
                  onChange={(date) => changeSpecificDate(date)} required />
                }
              </div>}
              <div className="col-lg-12 pt-8">
                {byLocationSelected && <button type="submit" className="btn btn-primary bg-blue-500 font-semibold" style={Styles.WidthReport} onClick={(e) => byLocation(e)} disabled={disabled}>
                  REQUEST DATA REPORT
                </button>}
                {employeeLocationSelected && <button type="submit" className="btn btn-primary bg-blue-500 font-semibold" style={Styles.WidthReport} onClick={(e) => byEmployee(e)} disabled={disabled}>
                  REQUEST DATA REPORT
                </button>}
                {adverseReactionSelected && <button type="submit" className="btn btn-primary bg-blue-500 font-semibold" style={Styles.WidthReport} onClick={(e) => byAdverseEffects(e)} disabled={disabled}>
                  REQUEST DATA REPORT
                </button>}
              </div>
            </form>
          </div>
          <div className="col-6">
            {submittedSE && <SideEffectsReportCard date={sec.date} patientName={sec.patientName} type_of_vaccine={sec.type_of_vaccine} doctor={sec.doctor} manufacturer={sec.manufacturer} brand={sec.brand} batch={sec.batch} side_effects={sec.side_effects} />}
            {submittedL && <LocationReportCard totalProccesed={lc.totalProccesed} totalModerna={lc.totalModerna} totalPfizer={lc.totalPfizer} totalJnJ={lc.totalJnJ} totalAstrozeneka={lc.totalAstrozeneka} totalNewVaccine={lc.totalNewVaccine} totalImm1={lc.totalImm1} totalImm2={lc.totalImm2} totalBooster1={lc.totalBooster1} totalBooster2={lc.totalBooster2} totalBooster3={lc.totalBooster3} totalUnknown={lc.totalUnknown} totalSideEffects={lc.totalSideEffects} />}
            {submittedE && <EmployeeReportCard employee={ec.employee} location={ec.location} totalProccesed={ec.total_proccesed} totalSideEffects={ec.total_side_effects} />}

          </div>
        </div>
        <Footer />
      </div>
    </Sidebar>
  )
}

export default ReportPage;