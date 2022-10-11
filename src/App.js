import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/screens/auth/Login';
import Booking from './components/screens/content/Booking';
import Locations from './components/screens/content/Locations';
import Patients from './components/screens/content/Patients';
import ReportPage from './components/screens/content/ReportPage';
import Schedule from './components/screens/content/Schedule';
import Maps from './components/screens/content/Maps';
import Contact from './components/screens/content/Contact';
import { useState } from 'react';
import PatientReport from './components/screens/content/PatientReport';
import Register from './components/screens/auth/Register';

function App() {

  const [isAuth, setIsAuth] = useState(false);

  return (
    <div>

      <Router>
        <Routes>
          {<Route path='/' element={<Login />}/>}
          <Route path='/login' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
          <Route path='/booking' element={<Booking setIsAuth={setIsAuth} />}/>
          <Route path='/locations' element={<Locations setIsAuth={setIsAuth} />}/>
          <Route path='/patients' element={<Patients setIsAuth={setIsAuth} />}/>
          <Route path='/report' element={<ReportPage setIsAuth={setIsAuth} />}/>
          <Route path='/schedule' element={<Schedule setIsAuth={setIsAuth} />}/>
          <Route path='/contact' element={<Contact setIsAuth={setIsAuth}/>}/>
          <Route path='/maps' element={<Maps />}/>
          <Route path='/patientreport' element={<PatientReport />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;