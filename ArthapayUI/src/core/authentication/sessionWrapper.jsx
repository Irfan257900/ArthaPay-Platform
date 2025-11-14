// src/authentication/SessionWrapper.js
import React, { useState, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { clearUserInfo } from "../../reducers/userconfig.reducer";
import { userLogout } from "../../reducers/auth.reducer";
import { useInactivityHandler } from "./useInactivityHandler";
import SessionTimeoutModal from "./sessionTimeout";

const SessionWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { getAccessTokenSilently, logout } = useAuth0();
  const IDLE_TIME_MS = 15 * 60 * 1000;

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const countdownRef = useRef(null);

  const handleIdle = () => {
    setShowModal(true);
    setCountdown(6);
    startCountdown();
  };

  const startCountdown = () => {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          handleRelogin();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleContinue = async () => {
    stopCountdown();
    try {
      await getAccessTokenSilently();
      setShowModal(false);
    } catch (e) {
      handleRelogin();
    }
  };

  const handleRelogin = useCallback(() => {
    stopCountdown();
    dispatch(clearUserInfo());
    dispatch(userLogout());
    localStorage.removeItem("redirectTo");
    logout({
      logoutParams: {
        federated: true,
        returnTo: `${window.runtimeConfig.VITE_REDIRECT_URI}#logout`,
      },
    });
  }, [dispatch, logout]);

  useInactivityHandler(handleIdle, IDLE_TIME_MS);

  return (
    <>
      {children}
      <SessionTimeoutModal
        showConfirmation={showModal}
        onContinue={handleContinue}
        onClose={handleRelogin}
        countdown={countdown}
      />
    </>
  );
};

export default SessionWrapper;
