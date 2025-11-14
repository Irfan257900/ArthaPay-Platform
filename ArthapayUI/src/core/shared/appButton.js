import { Button } from "antd";
import { Component } from "react";

class AppButton extends Component {

    render() {
        return <Button {...this.props} >
            {this.props.children}
        </Button>
    }
}

export default AppButton;