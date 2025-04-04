import { HashRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import TravelerList from './pages/TravelerList';
import TravelForm from "./pages/TravelForm";
import EventList from './pages/EventList';
import LandingPage from './pages/LandingPage';
import EventWithTravelerList from './pages/EventWithTravelerList';

function App() {

  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route
          path="/eventwithtravelerlist/:eventname"
          element={<EventWithTravelerList />} />
        <Route
          path="/travelform"
          element={<TravelForm />} />
        <Route
          path="/travellist"
          element={<TravelerList />} />
        <Route
          path="/eventlist"
          element={<EventList />} />
        <Route
          path="/"
          element={<LandingPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
