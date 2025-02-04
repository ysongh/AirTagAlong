import { HashRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import TravelerList from './pages/TravelerList';
import TravelForm from "./pages/TravelForm";

function App() {

  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route
          path="/travelform"
          element={<TravelForm />} />
        <Route
          path="/"
          element={<TravelerList />} />
      </Routes>
    </HashRouter>
  )
}

export default App
