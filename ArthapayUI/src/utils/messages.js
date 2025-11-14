import { message } from "antd";



export const success = (msg) => {

    message.destroy();

    message.success({

        content: msg,

        className: "custom-msg",

        duration:3

    });

};

export const warning = (msg) => {

    message.destroy();

    message.warning({

        content: msg,

        className: "custom-msg",

        duration: 0.75

    });

};



export const error = (msg) => {

    message.destroy();

    message.error({

        content: msg,

        className: 'custom-msg',

        duration: 0.5

      });

};