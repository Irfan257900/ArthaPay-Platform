import React from "react";

const FormInput = ({ children, label, isRequired }) => {
  return (
      <div className={`relative`}>
        <div className="custom-input-lablel">
                {label}
                {isRequired && <span className="text-requiredRed">{" *"}</span>}
        </div>
        <div className="text-left">{children}</div>
      </div>
  );
};

export default FormInput;
