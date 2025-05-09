import React, {useState, useEffect, useContext } from "react";
import { Route, BrowserRouter as Router, Routes, useNavigate ,Navigate} from "react-router-dom";
import Arrangements from "./Components/Phase_1/Arrangements";
import Footer from "./Components/Footer";
import HomePage from "./Components/Homepage";
import Navbar from "./Components/Navbar";
import Retest from "./Components/Phase_2/Retest";
import TimeTable from "./Components/Phase_1/TimeTable";
import Login from "./Components/Login";
import HODPage from "./Components/Phase_2/HODPage";
import AdministratorPage from "./Components/Phase_3/AdministratorPage";
import { UserContext } from "./Context/userContext";
import RefreshHandler from "./Components/RefreshHandler";
import StudentUpload from "./Components/Phase_3/AdministratorPage";

function App() {
  const { isLoggedIn, login } = useContext(UserContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/" replace />;
  };

  useEffect(() => {
    // Only run the authentication check and navigation on initial load
    if (isInitialLoad) {
      const token = localStorage.getItem("token");
      const userName = localStorage.getItem("userName");
      const loggedInType = sessionStorage.getItem("loggedInType");

      if (token && userName && loggedInType) {
        login(userName);
        setIsAuthenticated(true);
        // Only redirect to the user's homepage if they're on the login page
        if (window.location.pathname === '/') {
          const route = `/${loggedInType.toLowerCase()}`;
          navigate(route);
        }
      } else {
        setIsAuthenticated(false);
        navigate("/");
      }
      setIsInitialLoad(false);
    }
  }, [login, navigate, isInitialLoad]);

  return (
    <div className="min-h-screen flex flex-col">
      {isLoggedIn && <Navbar />}
      <main className="flex-1">
        <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/teacher" element={<PrivateRoute element={<HomePage />} />} />
          <Route path="/timetable" element={<PrivateRoute element={<TimeTable />} />} />
          <Route path="/arrangement" element={<PrivateRoute element={<Arrangements />} />} />
          <Route path="/retest" element={<PrivateRoute element={<Retest />} />} />
          <Route path="/HOD" element={<PrivateRoute element={<HODPage />} />} />
          <Route path="/administrator" element={<PrivateRoute element={<StudentUpload></StudentUpload>} />} />
        </Routes>
      </main>
      {isLoggedIn && <Footer />}
    </div>
  );
}

export default App;