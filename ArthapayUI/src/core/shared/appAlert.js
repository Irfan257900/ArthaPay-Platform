import { Alert } from "antd";

const AppAlert = (props) => {
  const {className,...otherProps}=props
  return <Alert className={className} {...otherProps}>{props.children}</Alert>;
};

export default AppAlert;