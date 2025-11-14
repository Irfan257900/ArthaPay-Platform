import React from "react";
// Corrected the import path to follow standard conventions for React components.
// This assumes the component file is named CreateButton.js or CreateButton.jsx
// inside the './create/' directory.
import CreateButton from "./create/create.button";

/**
 * A component to display a message when no accounts are found.
 * It's configurable with props to change its appearance and behavior.
 *
 * @param {object} props - The component props.
 * @param {string} [props.description] - The text to display. Defaults to a standard message.
 * @param {boolean} [props.showIcon=true] - Whether to show the bank icon on the left.
 * @param {boolean} [props.showButton=true] - Whether to show the "Create" button.
 */
const NoAccounts = ({
  description = (
    <>
      It looks like you don't have any accounts yet.
      Let's create one to get started!
    </>
  ),
  showIcon = true,
  showButton = true,
}) => {
  return (
    // Main container acting as a card.
    <div className="flex overflow-hidden rounded-lg no-account-box">
      
      {/* Conditionally render the Icon Box */}
      {showIcon && (
        <div className="flex items-center justify-center p-6 img-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-24 w-24 text-paraColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
            />
          </svg>
        </div>
      )}

      {/* Right side: Content Box */}
      <div className="flex flex-grow gap-3 items-center justify-between p-6 no-accounts-content">
        <p className="text-base font-light text-lightWhite">
          {description}
        </p>
        
        {/* Conditionally render the Create Button */}
        {showButton && <CreateButton />}
      </div>
    </div>
  );
};

export default NoAccounts;
