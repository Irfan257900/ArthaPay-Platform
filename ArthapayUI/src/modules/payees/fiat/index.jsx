import React from "react";
import { useParams } from "react-router";
import { connect } from "react-redux";
import Form from "./form";

import Payee from "../payee";
import Success from "../success";


const FiatPayees = (props) => {
  const { mode, step } = useParams();
  if (step === 'success') {
    return <Success />;
    
  }
  return (
    <div>
      {(!props.fiatPayees.loader || props.fiatPayees.data) && (mode === 'add' || mode === 'edit') && <Form props={props.fiatPayees.data} />}
      {(!props.fiatPayees.loader || props.fiatPayees.data) && mode === 'view' && <Payee />}
     </div>
  );
};

const connectStateToProps = ({ userConfig, payeeStore }) => {
  return {
    userConfig: userConfig.details,
    fiatPayees: payeeStore?.fiatPayees,
  };
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};
export default connect(
  connectStateToProps,
  connectDispatchToProps
)(FiatPayees);