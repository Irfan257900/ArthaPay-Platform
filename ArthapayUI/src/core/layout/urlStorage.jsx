// core/layout/urlStorage.jsx
import { useEffect } from "react";
import { useLocation } from "react-router";

const URLStorage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/callback") {
      localStorage.setItem("redirectTo", location.pathname);
    }
  }, [location]);

  return null;
};

export default URLStorage;
