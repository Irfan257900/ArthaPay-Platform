import React from "react";
import darknoData from '../../assets/images/dark-no-data.svg';
import lightnoData from '../../assets/images/light-no-data.svg';

const AppEmpty = ({
  title,                      // New: Optional title for the message
  description = "No Data",
  boxClass = 'nodata-content loader-position',
  children                    // New: Optional prop to pass a button or link
}) => {
  return (
    <div className={boxClass}>
      <div className='text-center'>
        <img src={darknoData} width={'100px'} alt={description} className="dark:inline-block hidden" />
        <img src={lightnoData} width={'100px'} alt={description} className="dark:hidden inline-block" />

        {/* Conditionally render the title only if it's provided */}
        {title && (
          <h3 className="text-base font-light text-lightWhite mt-4">
            {title}
          </h3>
        )}

        {/* The description is always shown */}
        <p className="text-base font-light text-lightWhite ">{description}</p>
        
        {/* Conditionally render any children (like a button) passed to the component */}
        {children && (
          <div className="mt-5">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppEmpty;