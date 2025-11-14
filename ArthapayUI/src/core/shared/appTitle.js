import { Typography } from "antd";
import { Component } from "react";
const { Title } = Typography;
class AppTitle extends Component {

    render() {
        return <Title {...this.props} >
            {this.props.children}
        </Title>
    }
}

export default AppTitle;