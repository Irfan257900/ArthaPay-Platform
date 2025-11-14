import { Col } from "antd";
import { Component } from "react";

class AppCol extends Component {
    
    render() {
        return <Col {...this.props} >
            {this.props.children}
        </Col>
    }
}

export default AppCol;