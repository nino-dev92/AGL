import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TournamentsPage from "./pages/TournamentsPage";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";
import ProfilePage from "./pages/ProfilePage";
import TournamentPage from "./pages/TournamentPage";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <>
              <title>Home</title>

              <div className="flex flex-col bg-agl-black min-h-screen">
                <Header />

                <main className="grow p-4">
                  <h1 className="text-hero-lg font-sans text-agl-red text-center">
                    AGL <span className="text-agl-yellow">Landing</span> page
                  </h1>
                </main>

                <Footer />
              </div>
            </>
          }
        />

        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournament/:id" element={<TournamentPage />} />
        <Route path="/players" element={<Players />} />
        <Route path="/player/:username" element={<PlayerProfile />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
