// old version
import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import PlainLoader from "../shared/loaders/plain.loader";
import { Navigate } from "react-router";

const SessionHandler = ({
  children,
  setUserInfo,
}) => {
  const {
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    error,
    user,
  } = useAuth0();
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      getToken();
    }
  }, [isAuthenticated,isLoading]);
  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      setUserInfo(token,user)
    } catch (error) {}
  };
  if(!isAuthenticated && !isLoading){
    return <Navigate to='/callback#logout'/>
  }
  if(isAuthenticated && !isLoading){
    return <>{children}</>
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }
  return <PlainLoader />
};

export default SessionHandler;


