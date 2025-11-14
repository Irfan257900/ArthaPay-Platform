import { Select } from "antd";

const AppSelect = (props) => {
    return (
        <Select {...props}>
            {props.children}
        </Select>
    );
};
AppSelect.Option=Select.Option
export default AppSelect;