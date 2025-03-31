// UserContext.jsx
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize state from localStorage/sessionStorage
  const [user, setUser] = useState(() => localStorage.getItem('userName') || 'Guest');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('token');
    const userType = sessionStorage.getItem('loggedInType');
    return !!(token && userType); // Returns true if both exist
  });

  const login = (userName) => {
    if (userName) {
      setUser(userName);
      setIsLoggedIn(true);
    }
  };
    
  const logout = () => {
    setUser('Guest');
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    sessionStorage.clear();
  };

  // Recheck auth state whenever the component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userType = sessionStorage.getItem('loggedInType');

    if (token && userName && userType) {
      setUser(userName);
      setIsLoggedIn(true);
    } else {
      setUser('Guest');
      setIsLoggedIn(false);
    }
  }, []);
    
  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};