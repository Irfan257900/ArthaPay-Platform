import React from "react";
import { connect } from 'react-redux';
import {  useParams } from "react-router";
import Success from "../success";
import SatoshiTest from "./satoshiTest";
import SelfSign from "./selfSign";
import Payee from "../payee";
import Form from "./form";

const CryptoPayee = (props) => {
  const { mode,step } = useParams();
  if(step==='success'){
    return <Success/>
  }
  if(step==='satoshitest'){
    return <SatoshiTest/>
  }
  if(step==='selfsign'){
    return <SelfSign/>
  }
  return (
    <div>
    {(!props.cryptoPayees.loader || props.cryptoPayees.data) && (mode === 'add' || mode === 'edit') && <Form props={props?.cryptoPayees?.data} />}
    {(!props.cryptoPayees.loader || props.cryptoPayees.data) && mode === 'view' && <Payee />}
  </div>
  )

}

const connectStateToProps = ({ userConfig, payeeStore }) => {
  return { userConfig: userConfig.details, cryptoPayees: payeeStore?.cryptoPayees };
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};
export default connect(
  connectStateToProps,
  connectDispatchToProps
)(CryptoPayee);