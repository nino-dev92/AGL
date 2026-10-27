import "./App.css";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex flex-col bg-agl-black min-h-screen">
            <Header />

            <main className="grow">
              <Home />
              {/* Landing page sections go here */}
            </main>

            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
