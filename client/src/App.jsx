import { HashRouter, Route, Routes } from 'react-router-dom';

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
          element={
            <>
              <h1>Test</h1>
            </>} />
      </Routes>
    </HashRouter>
  )
}

export default App
