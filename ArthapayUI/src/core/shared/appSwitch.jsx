import React from "react";
import {Switch} from 'antd'
const AppSwitch = ({
    checked,
    onChange,
    checkedText,
    unCheckedText,
}) => {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      checkedChildren={checkedText}
      unCheckedChildren={unCheckedText}
    />
  );
};

export default AppSwitch;
