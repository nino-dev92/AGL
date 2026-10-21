import "./App.css";
import { Route, Routes } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Tournaments from "./pages/Tournaments";

function App() {
  const { auth } = useAuth();

  useEffect(() => {
    console.log(auth);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex flex-col bg-agl-black min-h-screen">
            <Header />

            <main className="grow p-4">
              <h1 className="text-hero-lg font-sans text-agl-danger text-center">
                AGL <span className="text-agl-accent">Landing</span> page
              </h1>
            </main>

            <Footer />
          </div>
        }
      />

      <Route path="/tournaments" element={<Tournaments />} />
    </Routes>
  );
}

export default App;
