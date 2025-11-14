import { useCallback, useEffect, useState } from "react";
import { Alert, Form, Tooltip } from "antd";
import CustomButton from "../../button/button";
import StepProgress from "../kyc/step.progress";
import CommonDrawer from "../../shared/drawer";
import DirectorsForm from "./directors";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../../shared/loader";
import { errorMessages, kyckybTitles, openNotification, tosterMessages } from "../services";
import { setCurrentKycState } from "../../../reducers/userconfig.reducer";
import AppDefaults from "../../../utils/app.config";
import { getDirectorDetails, sendDirectorDetails } from "../http.services";
import { decryptAES } from "../../shared/encrypt.decrypt";

const DirectorsDetails = () => {
  const dispatch = useDispatch();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const userProfileInfo = useSelector(
    (state) => state.userConfig.details
  );
  const [data, setData] = useState([]);
  const toggleDrawer = useCallback(() => {
    setDrawerVisible(!drawerVisible);
  }, [drawerVisible]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const actionFrom = queryParams.get("actionFrom");
  const safeActionFrom = actionFrom || "default";
  const handleSave = useCallback(
    (obj) => {
      setError(null);
      if (obj.dob && obj.dob._isAMomentObject) {
        obj.dob = obj.dob.format("DD-MM-YYYY");
      }
      if (obj.dateOfRegistration && obj.dateOfRegistration._isAMomentObject) {
        obj.dateOfRegistration = obj.dateOfRegistration.format("DD-MM-YYYY");
      }
      setDrawerVisible(!drawerVisible);
      if (obj.id !== AppDefaults.GUID_ID) {
        setData((prevData) => {
          const existingIndex = prevData.findIndex(
            (item) => item.id === obj.id
          );
          if (existingIndex !== -1) {
            const updatedData = [...prevData];
            updatedData[existingIndex] = {
              ...updatedData[existingIndex],
              ...obj,
            };
            return updatedData;
          }
          return [...prevData, obj];
        });
      } else {
        setData((prevData) => [...prevData, obj]);
      }
    },
    [data, drawerVisible]
  );
  const steps = [
    { number: 1, label: "Company", isActive: true, isCompleted: true },
    { number: 2, label: "UBO", isActive: true, isCompleted: true },
    { number: 3, label: "Directors", isActive: true },
    { number: 4, label: "Review", isActive: false },
  ];

  useEffect(() => {
    if (userProfileInfo) fetchDirectorDetails();
  }, [userProfileInfo]);

  const fetchDirectorDetails = async () => {
    await getDirectorDetails(setLoader,setData, setError);
  };
  const onSuccess = () => {
    openNotification(tosterMessages.DirectorsSuccessMSg);
    dispatch(setCurrentKycState(3));
    dispatch(setKycStatus("Draft"));
  };
  const handleSubmit = useCallback(async () => {
    if (data.length === 0) {
      setError(errorMessages.DirectorRequiredMsg);
      return;
    }
    await sendDirectorDetails(
      setBtnLoader,
      onSuccess,
      setError,
     {details: data,
      method:false}
    );
  }, [data, userProfileInfo]);
  const onCancel = useCallback(() => {
    setDrawerVisible(!drawerVisible);
  }, []);
  const handleDelete = (index) => {
    const newData = [...data];
    if (newData[index].id !== AppDefaults.GUID_ID) {
      newData[index].recordStatus = "deleted";
    } else {
      newData.splice(index, 1);
    }
    setData(newData);
  };
  const onCloseError = useCallback(() => {
    setError(null);
  }, []);
  return (
    <div>
      {loader && <Loader />}
      <div className="text-secondaryColor kpicardbg h-full">
        <div className="h-full rounded-2xl bg-kpiCard">
          <div className="basicinfo-form">
            <h1 className="text-center text-lightWhite text-3xl font-semibold">
              KYB
            </h1>
            <p className="text-sm font-normal text-lightWhite mt-4 mb-7 text-center">
              {" "}
              {kyckybTitles[safeActionFrom]} our partners require some
              information from you
            </p>
            <div className="">
              <div className="w-full ">
                <StepProgress steps={steps} />
                {error !== null && (
                  <div className="alert-flex">
                    <Alert
                      type="error"
                      description={error}
                      onClose={onCloseError}
                      showIcon
                      className="items-center"
                    />
                    <button
                      className="icon sm alert-close"
                      onClick={onCloseError}
                    ></button>
                  </div>
                )}
                <CommonDrawer
                  title="Add Directors"
                  isOpen={drawerVisible}
                  onClose={toggleDrawer}
                >
                  <DirectorsForm
                    onSave={handleSave}
                    onCancel={onCancel}
                    drawerVisible={drawerVisible}
                  />
                </CommonDrawer>
                <Form>
                  <div className="mt-10 w-full  px-5 py-4">
                    <div className="text-right">
                      <Tooltip title="Add Director">
                        <button
                          onClick={toggleDrawer}
                          className="p-0 bg-0 outline-none focus:bg-none hover:bg-none focus:border-none"
                        >
                          <span className="icon add"></span>
                        </button>
                      </Tooltip>
                    </div>
                    {data?.length > 0 && (
                      <div className="overflow-auto">
                        <table className="w-full table-style">
                          <thead>
                            <tr className="bg-transparent border border-StrokeColor rounded-5">
                              <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">
                                Type
                              </th>
                              <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">
                                Name
                              </th>
                              <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">
                                Phone Number
                              </th>
                              <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data
                              ?.filter((row) => row.recordStatus !== "deleted")
                              .map((row, index) => (
                                <tr
                                  key={row?.id}
                                  className=" mt-3 hover:bg-kendotdBghover"
                                >
                                  <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                                    {row.uboPosition}
                                  </td>
                                  <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                                    {row?.companyName || row.firstName}
                                  </td>
                                  <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                                    {decryptAES(row.phoneCode)} {decryptAES(row.phoneNumber)}
                                  </td>
                                  <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                                    <div className="flex items-center gap-4">
                                      <span
                                        className="icon delete cursor-pointer"
                                        onClick={() => handleDelete(index)}
                                      ></span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {data?.length === 0 && (
                      <div className="text-center">
                        <h3 className="text-xl font-medium text-lightWhite mb-4">
                          Click Here To Add Directors
                        </h3>
                        <CustomButton
                          type="primary"
                          className={""}
                          loading={btnLoader}
                          disabled={btnLoader}
                          onClick={toggleDrawer}
                        >
                          Add Director
                        </CustomButton>
                      </div>
                    )}
                  </div>
                  <div className="text-end mt-9">
                    <CustomButton
                      type="primary"
                      className={""}
                      disabled={btnLoader}
                      loading={btnLoader}
                      onClick={handleSubmit}
                    >
                      Save & Continue
                    </CustomButton>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorsDetails;
