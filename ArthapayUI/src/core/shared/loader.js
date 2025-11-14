import { Spin } from "antd";

const Loader = (props) => {
	return (
		<div className="loader-antd" style={props.style}>
			<Spin {...props} />
		</div>
	);
};
export default Loader;
