import { Typography } from "antd";
import { Component } from "react";
const { Paragraph } = Typography;
class AppParagraph extends Component {

    render() {
        return <Paragraph {...this.props} >
            {this.props.children}
        </Paragraph>
    }
}

export default AppParagraph;