import React from "react";

const IconPlaceholder = ({
    background='!bg-textPrimary',
    width='w-10',
    height='h-10',
    rounded='rounded-full',
    className='text-lg font-semibold flex justify-center items-center text-lightDark custom-icon',
    children
}) => {
  return (
    <div
      className={`${className} ${background} ${width} ${height} ${rounded}`}
    >
      {children}
    </div>
  );
};

export default IconPlaceholder;
