import { message } from "antd";
const successDefaults = {
    message: "Successful!",
    className: "custom-msg",
    duration: 3,
    onClose: ()=>{},
}
const warningDefaults = {
    message: "Warning!",
    className: "custom-msg",
    duration: 3,
    onClose: ()=>{},
}
const errorDefaults = {
    message: "Error!",
    className: "custom-msg",
    duration: 3,
    onClose: ()=>{},
}
export const successToaster = ({content = successDefaults.message, className = successDefaults.className, duration = successDefaults.duration, onClose = successDefaults.onClose})=>{
    message.success({ content, className, duration,onClose });
}
export const warningToaster = ({content = warningDefaults.message, className = warningDefaults.className, duration = warningDefaults.duration, onClose = warningDefaults.onClose})=>{
    message.warning({ content, className, duration,onClose });
}
export const errorToaster = ({content = errorDefaults.message, className = errorDefaults.className, duration = errorDefaults.duration, onClose = errorDefaults.onClose})=>{
    message.error({ content, className, duration,onClose });
}
export const destroyToaster=()=>{
    message.destroy()
}