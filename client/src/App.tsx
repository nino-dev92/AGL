import "./App.css";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import TournamentsPage from "./pages/TournamentsPage";
import TournamentPage from "./pages/TournamentPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ScrollToTop from "./components/ScrollTop";
import GeneralLayout from "./layouts/GeneralLayout";
import PageWrapper from "./utils/PageWrapper";

function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournament/:id" element={<TournamentPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/player/:username" element={<PlayerProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="*"
            element={
              <GeneralLayout>
                <PageWrapper>
                  <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-agl-primary">
                    <h1 className="text-4xl font-bold">Page not found</h1>
                    <Link to="/" className="text-agl-yellow underline">
                      Return home
                    </Link>
                  </main>
                </PageWrapper>
              </GeneralLayout>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
