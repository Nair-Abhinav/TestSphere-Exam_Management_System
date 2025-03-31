import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

function RefreshHandler({ setIsAuthenticated }) {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const loggedInType = sessionStorage.getItem("loggedInType");

    if (token && userName && loggedInType) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [location.pathname, setIsAuthenticated]);

  return null;
}

export default RefreshHandler;