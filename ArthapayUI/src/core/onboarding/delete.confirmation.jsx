import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import CustomButton from "../button/button";
import AppAlert from "../shared/appAlert";
import { sendUBODetails, sendDirectorDetails } from "./http.services";

const BusinessDataDelete = ({
  selectedIndex,
  data,
  setShowModal,
  userConfig,
  onSuccessDelete,
  setUbosData,
  type,
}) => {
  const [error, setError] = useState("");
  const [btnLoader, setBtnLoader] = useState(false);

  const confirmActivate = useCallback(async () => {
    error && setError("");
    const newData = [...data];
    if (newData[selectedIndex].id !== "00000000-0000-0000-0000-000000000000") {
      newData[selectedIndex].recordStatus = "Deleted";
      type != "directors" &&
        (await sendUBODetails(setBtnLoader, onSuccessDelete, setError, {
          details: newData,
          method: true,
        }));
      type === "directors" &&
        (await sendDirectorDetails(setBtnLoader, onSuccessDelete, setError, {
          details: newData,
          method: true,
        }));
    } else {
      newData.splice(selectedIndex, 1);
      onSuccessDelete();
      setUbosData(newData);
    }
  }, [userConfig, onSuccessDelete, data, type, selectedIndex]);

  const onErrorClose = useCallback(() => {
    setError("");
  }, []);
  const showModal = useCallback(() => {
    setShowModal(false);
  }, []);
  return (
    <>
      <div className="text-left card-disable py-6">
        {error && (
          <div className="alert-flex">
            <AppAlert
              type="error"
              description={error}
              onClose={onErrorClose}
              showIcon
            />
          </div>
        )}
        <p className="!text-md mb-0 !text-lightWhite font-semibold">
          Do you really want to delete ?
        </p>
      </div>
      <div className="mt-9 text-right">
        <CustomButton className={""} onClick={showModal}>
          No
        </CustomButton>
        <CustomButton
          className={"md:ml-3.5"}
          loading={btnLoader}
          disabled={btnLoader}
          type="primary"
          onClick={confirmActivate}
        >
          Yes
        </CustomButton>
      </div>
    </>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return { userConfig: userConfig.details };
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};
BusinessDataDelete.propTypes = {
  data: PropTypes.array,
  setShowModal: PropTypes.func,
  userConfig: PropTypes.object,
  selectedIndex: PropTypes.string,
  onSuccessDelete: PropTypes.func,
  setUbosData: PropTypes.func,
  type: PropTypes.string,
};
export default connect(
  connectStateToProps,
  connectDispatchToProps
)(BusinessDataDelete);
