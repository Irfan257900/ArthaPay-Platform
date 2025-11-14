import { Tooltip } from "antd";
import { Component } from "react";

class AppTooltip extends Component{
    render(){
        return <Tooltip {...this.props}>
            {this.props.children}
        </Tooltip>
    }
}
export default AppTooltip;