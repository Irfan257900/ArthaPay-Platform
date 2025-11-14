import React, { useCallback, useState } from "react";
import { Modal, Alert, Button } from 'antd';
import { connect } from "react-redux";
import Overview from '../../modules/cards/overview'
import { saveCreateCard } from "../../modules/cards/httpServices";

const AddCardComponent = (props) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [showAllCards, setShowAllCards] = useState(false);

  const handleOk = useCallback(async () => {

    let obj = {};
    const urlParams ={ id:props?.userProfile?.id,obj:obj}
    let response = await saveCreateCard(setShowAllCards,setErrorMsg,urlParams);
    if (response.ok) {
      setShowAllCards(true);
      props?.onCardSave(); 
      props?.onCancel()
      setErrorMsg(null);
    } else {
      setShowAllCards(false);
      props?.onCancel();
      setErrorMsg(response);
    }
  },[props]);

  return (
    <>
      <Modal
        className="create-card"
        title="Create Card Confirmation"
        visible={props?.modal}
        onOk={handleOk}
        onCancel={props?.onCancel}
        footer={[
          <Button key="back" onClick={props?.onCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            OK
          </Button>,
        ]}
      >
        {errorMsg !== undefined && errorMsg !== null && (
          <Alert variant="danger" className='alert-flex' description={errorMsg} showIcon>
            <p style={{ color: 'red', margin: 10 }}><span className="icon error-alert me-2"></span>{errorMsg}</p>
          </Alert>
        )}
        {/* <h3><b>Confirm, to Create Your Card.</b></h3> */}
        <p>By creating your card, you will be able to make purchases and add new payment methods. However, it is important to note that before proceeding, you must deposit money into your fiat wallet.</p>
      </Modal>
      {showAllCards && <Overview showAllCards={showAllCards} setRefresh={props.setRefresh} />}
    </>
  )
};

const connectStateToProps = ({ userConfig }) => {
  return { userProfile: userConfig?.details };
};

const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(
  connectStateToProps,
  connectDispatchToProps
)(AddCardComponent);
