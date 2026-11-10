import "./App.css";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Tournaments from "./pages/Tournaments";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <title>Home</title>

            <div className="flex flex-col bg-agl-black min-h-screen">
              <Header />
              <Home />
              <Footer />
            </div>
          </>
        }
      />

      <Route path="/tournaments" element={<Tournaments />} />
      <Route path="/players" element={<Players />} />
      <Route path="/player/:username" element={<PlayerProfile />} />
    </Routes>
  );
}

export default App;