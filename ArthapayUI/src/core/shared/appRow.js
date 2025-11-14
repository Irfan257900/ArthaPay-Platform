import { Row } from "antd";
import { Component } from "react";

class AppRow extends Component {
    
    render() {
        return <Row {...this.props} >
            {this.props.children}
        </Row>
    }
}

export default AppRow;