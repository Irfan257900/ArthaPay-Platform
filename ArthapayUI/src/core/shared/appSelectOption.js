import React from "react";
import { Select } from "antd";

const AppSelectOption = (props) => {
  return <Select.Option {...props}>{props.children}</Select.Option>;
};

export default AppSelectOption;