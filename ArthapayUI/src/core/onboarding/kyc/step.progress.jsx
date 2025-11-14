import React from "react";

const StepProgress = ({ steps }) => {

  const getCircleClassNames = (isCompleted, isActive) => {
    if (isCompleted) {
      return "bg-transparent opacity-70 border-primaryColor text-primaryColor border";
    } else if (isActive) {
      return "bg-primaryColor border-primaryColor border-2 text-textWhite";
    } else {
      return "bg-bodyBg text-lightWhite border-lightWhite border-2";
    }
  };

  const getLabelClassNames = (isCompleted, isActive) => {
    if (isActive) {
      return "text-primaryColor";
    } else if (isCompleted) {
      return "text-primaryColor opacity-60";
    } else {
      return "text-stepsGrey";
    }
  };
  return (
    <div className="flex justify-center items-center text-center md:space-x-4 space-x-2 overflow-auto">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center mb-2">
            <div
              className={`md:w-10 md:h-10 w-6 h-6 flex justify-center items-center rounded-full md:text-sm text-xs font-semibold 
              ${getCircleClassNames(
                  step.isCompleted,
                  step.isActive
                )}`
              }
            >
              {step.isCompleted ? "✔" : step.number}
            </div>
            <p
              className={`mt-2 md:text-sm text-[10px] font-semibold ${getLabelClassNames(
                step.isCompleted,
                step.isActive
              )}`}
            >
              {step.label}
            </p>
          </div>

          {/* Line after the circle */}
          {index !== steps.length - 1 && (
            <div className="md:flex-1 h-px md:w-16 w-10 border-t-2 border-stepsGrey mt-[-22px]"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepProgress;
