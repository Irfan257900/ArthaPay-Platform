// src/authentication/useInactivityHandler.js
import { useEffect, useRef } from "react";

// Key for storing the last active time in localStorage
const LAST_ACTIVE_KEY = "app_last_active_time";
// Key for notifying an idle event has occurred (optional, but useful)
const IDLE_EVENT_KEY = "app_idle_event";

/**
 * Custom hook to handle inactivity across multiple browser tabs.
 *
 * @param {Function} onIdle - Callback function to execute when the user becomes idle.
 * @param {number} idleTime - Time in milliseconds after which the user is considered idle (default: 15 minutes).
 */
export const useInactivityHandler = (onIdle, idleTime = 15 * 60 * 1000) => {
  const timer = useRef(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  // Function to update the last active time in localStorage
  const updateActiveTime = () => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  };

  // Function to reset the local idle timer
  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // Before calling onIdle, check if any other tab was recently active.
      const lastActiveTime = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || "0", 10);
      const currentTime = Date.now();

      // If the difference is greater than or equal to idleTime, it means all tabs have been inactive.
      if (currentTime - lastActiveTime >= idleTime) {
        // Optional: Notify other tabs that an idle event is triggering,
        // which can prevent them from triggering their own simultaneously.
        localStorage.setItem(IDLE_EVENT_KEY, Date.now().toString());
        // Remove the key immediately to allow a subsequent re-login/re-active action to reset
        localStorage.removeItem(IDLE_EVENT_KEY);

        // Execute the idle callback
        onIdleRef.current();
      } else {
        // If another tab was active, restart the local timer
        resetTimer();
      }
    }, idleTime);
  };

  // --- Effect Hook for Initialization and Cleanup ---
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    // Local event handler: updates local storage and resets the local timer
    const handleLocalEvent = () => {
      updateActiveTime(); // Broadcasts activity to all tabs
      resetTimer();       // Resets the timer for the current tab
    };

    // Storage event handler: monitors activity from other tabs
    const handleStorageEvent = (event) => {
      // Only care about the last active time key changes
      if (event.key === LAST_ACTIVE_KEY && event.newValue) {
        // If another tab was active, we reset our local timer
        resetTimer();
      }
    };

    // 1. Set up listeners for local activity
    events.forEach((event) =>
      window.addEventListener(event, handleLocalEvent)
    );

    // 2. Set up listener for activity from other tabs
    window.addEventListener('storage', handleStorageEvent);

    // 3. Initialize: Mark as active and start the timer
    updateActiveTime();
    resetTimer();

    // 4. Cleanup function
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleLocalEvent)
      );
      window.removeEventListener('storage', handleStorageEvent);

      if (timer.current) clearTimeout(timer.current);
    };

    // Note: Dependencies include idleTime, but not onIdle because we use a ref (onIdleRef)
    // to avoid unnecessary re-runs of the effect when onIdle is stable but changes identity.
  }, [idleTime]);
};