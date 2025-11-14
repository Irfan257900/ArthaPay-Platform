import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import PlainLoader from "../shared/loaders/plain.loader";
import { useAuth0 } from "@auth0/auth0-react";
export default function CallbackHandler() {
  const action = window.location.hash;
  const {loginWithRedirect}=useAuth0()
  const navigate = useNavigate();
  useEffect(() => {
    handleRedirect();
  }, [action]);
  const handleRedirect = () => {
    if(!action){
      return;
    }
    if (["login", "#login"].includes(action)) {
      const storedPath = localStorage.getItem("redirectTo");
      if (storedPath) {
        navigate(storedPath);
      } else {
        navigate("/");
      }
    } else {
      const redirectTo = localStorage.getItem("redirectTo");
      loginWithRedirect({ appState: { returnTo: redirectTo || "/" } });
    }
  };
  return <PlainLoader />;
}
