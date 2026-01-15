import { HashRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  return (
   <HashRouter>
      <Routes>
        <Route
          path="/profile"
          element={<Profile />} />
        <Route
          path="/"
          element={<Home />} />
      </Routes>
    </HashRouter>
  )
}

export default App;