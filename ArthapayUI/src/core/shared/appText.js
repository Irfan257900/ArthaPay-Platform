import { Typography } from "antd";
import { Component } from "react";
const { Text } = Typography;
class AppText extends Component {

    render() {
        return <Text {...this.props} >
            {this.props.children}
        </Text>
    }
}

export default AppText;