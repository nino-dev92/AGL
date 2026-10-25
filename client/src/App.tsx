import "./App.css";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Tournaments from "./pages/Tournaments";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";

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

              <main className="grow p-4">
                <h1 className="text-hero-lg font-sans text-agl-danger text-center">
                  AGL <span className="text-agl-accent">Landing</span> page
                </h1>
              </main>

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
