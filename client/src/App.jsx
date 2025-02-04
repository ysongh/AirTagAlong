import { HashRouter, Route, Routes } from 'react-router-dom';

import TravelerList from './pages/TravelerList';
import TravelForm from "./pages/TravelForm";

function App() {

  return (
    <HashRouter>
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
