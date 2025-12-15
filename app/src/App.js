import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import LandingPage from "./Pages/LandingPage";
import AllCars from "./Pages/AllCars";
import { Layout } from './components/Layout';
import MyBookings from "./Pages/MyBookings";
import ListYourCar from "./Pages/ListYourCar";
import CarDetails from "./components/CarDetails";
import Dashboard from "./Pages/Dashboard";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ContextStoreProvider } from './context/contextStore';

function App() {
  return (
    <ContextStoreProvider>
      <div className="App">
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="/Cars" element={<AllCars />} />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/list-car"
                element={
                  <ProtectedRoute>
                    <ListYourCar />
                  </ProtectedRoute>
                }
              />
              <Route path="/cars/:id" element={<CarDetails />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </ContextStoreProvider>);
}

export default App;
