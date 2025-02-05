import { HashRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import TravelerList from './pages/TravelerList';
import TravelForm from "./pages/TravelForm";
import EventList from './pages/EventList';

function App() {

  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route
          path="/travelform"
          element={<TravelForm />} />
        <Route
          path="/travellist"
          element={<TravelerList />} />
        <Route
          path="/"
          element={<EventList />} />
      </Routes>
    </HashRouter>
  )
}

export default App
