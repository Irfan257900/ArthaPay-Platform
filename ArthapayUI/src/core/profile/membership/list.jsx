import {  useCallback, useEffect, useRef, useState } from "react";
import Grid from "../../grid.component";
import { Alert, Tooltip } from "antd";
import CommonDrawer from "../../shared/drawer";
import CustomButton from "../../button/button";
import {
  memberActiveInactive,
  membershipDefault,
} from "../http.services";
import { Outlet, useNavigate, useOutletContext } from "react-router";
import AppDefaults from "../../../utils/app.config";
import {
  MembershipNameCell,
  MembershipPriceCell,
  ReferralBonusCell,
  renderDateCell,
  renderModifiedDateCell,
  renderStatusCell,
} from "./custom.cells";
import ActionController from "../../onboarding/action.controller";
import { successToaster } from "../../shared/toasters";
import { currentApiVersion } from "../../http.clients";
const actions = [
  {
    key: "add",
    className: "icon add-links cursor-pointer",
    label: "Add Membership",
  },
  {
    key: "edit",
    className: "icon Edit-links cursor-pointer",
    label: "Edit Membership",
  },
  {
    key: "toggleStatus",
    className: "icon Disable-links cursor-pointer",
    label: "Active/Inactive",
  },
  {
    key: "setDefault",
    className: "icon Settings-links cursor-pointer",
    label: "Set Default",
  },
  {
    key: "setFees",
    className: "icon setfee-links cursor-pointer",
    label: "Set Fees",
  },
];
const path = `/profile/memberships`;
const baseURL = `${window.runtimeConfig.VITE_CORE_API_END_POINT}/${currentApiVersion}`;
const List = () => {
  const { baseBreadCrumb, setBreadCrumb } = useOutletContext();
  const gridRef = useRef();
  const [selection, setSelection] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusToggle, setStatusToggle] = useState(false);
  const [isDefaultDrawer, setIsDefaultDrawer] = useState(false);
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();
  const [statusToggleError, setStatusToggleError] = useState(null);

  useEffect(() => {
    setBreadCrumb([...baseBreadCrumb, { id: "3", title: "Memberships" }]);
  }, []);
  const inputCheckBoxHandle = useCallback(
    (prop) => {
      setErrorMessage(null);
      const rowChecked = prop.dataItem;
      let _selection = [];
      let idx = selection.findIndex((item) => item.id === rowChecked.id);
      if (idx > -1) {
        _selection.splice(idx, 1);
      } else {
        _selection.push(rowChecked);
      }
      setSelection(_selection);
    },
    [selection]
  );
  const renderSelectionBox = (cellProps) => {
    return (
      <td key={cellProps?.dataItem.id} className="text-center">
        {" "}
        <label className="text-center custom-checkbox">
          <input
            id={cellProps?.dataItem.id}
            name="check"
            type="checkbox"
            checked={
              selection.findIndex((item) => item.id === cellProps.dataItem.id) >
              -1
            }
            onChange={() => inputCheckBoxHandle(cellProps)}
          />
          <span></span>{" "}
        </label>
      </td>
    );
  };

  const membershipColoumns = [
    {
      field: "",
      title: "",
      width: 50,
      filter: false,
      sortable: false,
      customCell: renderSelectionBox,
    },
    {
      field: "name",
      title: "Name",
      width: 180,
      filter: true,
      customCell: MembershipNameCell,
    },
    {
      field: "accountType",
      title: "Account Type",
      width: 170,
      filter: true,
      filterType:'text',
    },
    {
      field: "price",
      title: "Price ($)",
      filter: false,
      filterType: "numeric",
      width: 120,
      customCell: MembershipPriceCell,
    },
    {
      field: "referralBonus",
      title: "Bonus (%)",
      filter: false,
      filterType: "numeric",
      width: 100,
      customCell: ReferralBonusCell,
    },
    {
      field: "status",
      title: "Status",
      filter: false,
      filterType: "text",
      width: 100,
      customCell: renderStatusCell,
    },
    {
      field: "createdDate",
      title: "Created Date",
      filter: true,
      filterType: "date",
      width: 170,
      customCell: renderDateCell,
    },
    {
      field: "modifiedDate",
      title: "Modified Date",
      filter: false,
      filterType: "date",
      width: 180,
      customCell: renderModifiedDateCell,
    },
  ];
  const handleAction = useCallback((action) => {
    const _actions = {
      add: addMember,
      edit: editMember,
      setFees: setFees,
      toggleStatus: handleStatusToggle,
      setDefault: handleDefault,
    };
    _actions[action.key]();
  },[selection,errorMessage,statusToggle,isDefaultDrawer]);

  const setFees = () => {
    if (selection?.length > 0) {
      setErrorMessage(null);
      navigate(
        `/profile/memberships/${selection?.[0]?.id}/${selection?.[0]?.name}/feesetup`
      );
    } else setErrorMessage("Please select one record.");
  };
  const handleStatusToggle = () => {
    const selectedItem = selection?.[0];
    if (!selectedItem) setErrorMessage("Please select one record.");
    else if (selectedItem?.isFeeSetupCompleted !== true) {
      setErrorMessage("You can't change state untill fees is set.");
    } else if (selectedItem?.isFeeSetupCompleted === true) {
      setErrorMessage(null);
      setStatusToggle(true);
    }
  };
  const toggleDrawer = (screenName) => {
    if (screenName === "status") {
      setStatusToggle(false);
    } else if (screenName === "default") {
      setIsDefaultDrawer(false);
    }
    setStatusToggleError(false);
    setLoading(null);
    setSelection([]);
    gridRef?.current?.refreshGrid();
  };
  const sendStatusToggleResponse = () => {
    successToaster(
      {content:`Membership ${
        selection?.[0]?.status?.toLowerCase() === "inactive" ? "activated" : "deactivated"
      } successfully.`}
    );
    toggleDrawer("status");
  };
  const sendDefaultResponse = () => {
    successToaster({content:`Default membership updated successfully.`})
    toggleDrawer("default");
  };
  const submitStatusToggle = useCallback(() => {
    memberActiveInactive(
      {
        membership:selection[0],
        setLoader:(payload)=>setLoading(payload ? "status" :''),
        onSuccess:sendStatusToggleResponse,
        onError:setStatusToggleError,

      }
    );
  }, [selection[0]]);
  const addMember = () => {
    navigate(`/profile/memberships/${AppDefaults?.GUID_ID}/null/Add`);
  };
  const submitDefault = useCallback(() => {
    membershipDefault(
      {
        membership:selection[0],
        setLoader:(payload)=>setLoading(payload ? "default" :''),
        onSuccess:sendDefaultResponse,
        onError:setStatusToggleError,
      }
    );
  }, [
    selection,
  ]);
  const handleDefault = () => {
    const selectedItem = selection?.[0];
    if (!selectedItem) setErrorMessage("Please select one record.");
    else if (selectedItem?.status?.toLowerCase() === "active") {
      setErrorMessage(null);
      setIsDefaultDrawer(true);
    } else if (selectedItem?.status?.toLowerCase() !== "active") {
      setErrorMessage("You can't set this inactive membership as default.");
    }
  };
  const editMember = () => {
    if (selection.length === 0) {
      setErrorMessage("Please select one record.");
      return;
    }
    navigate(
      `/profile/memberships/${selection[0]?.id}/${selection[0]?.name}/Edit`
    );
  };
  const closeDrawer = useCallback(() => {
    setIsDefaultDrawer(false);
    setStatusToggleError(null);
    setStatusToggle(false);
    setSelection([]);
  }, []);
  const handleToggleAlertClose = useCallback(() => {
    setStatusToggleError(null);
  }, []);
  const handleAlertClose = useCallback(() => {
    setErrorMessage(null);
  }, []);
  return (
    <div className=" kpicardbg h-full">
      {errorMessage && (
        <div className="alert-flex">
          <Alert
            type="error"
            description={errorMessage}
            onClose={handleAlertClose}
            showIcon
            className="items-center"
          />
          <button
            className="icon sm alert-close"
            onClick={handleAlertClose}
          ></button>
        </div>
      )}
      <div className="flex gap-3 items-center justify-end mb-2">
        {actions.map((action, index) => {
          const isLastAction =
            actions.length >= 2 && index === actions.length - 1;
          return (
            <Tooltip
              key={action.key}
              placement={isLastAction ? "left" : "top"}
              title={action?.label}
              className="inline-block"
            >
              {" "}
              <ActionController
                handlerType="button"
                onAction={handleAction}
                actionParams={[action]}
                actionFrom={"Memberships"}
                buttonType="plain"
                buttonClass={
                  "p-0 rounded-full hover:bg-transparent focus:outline-0 outline-offset-0 border-none"
                }
                redirectTo={path}
              >
                <span className={action.className}></span>
              </ActionController>
            </Tooltip>
          );
        })}
      </div>
      <Grid
        columns={membershipColoumns}
        className="custom-grid"
        url={`${baseURL}memberships`}
        pSize={10}
        ref={gridRef}
      />
      {statusToggle && (
        <CommonDrawer
          title={`Confirm ${
            selection?.[0]?.status?.toLowerCase() === "active"
              ? "Deactivate"
              : "Activate"
          }`}
          isOpen={statusToggle}
          onClose={closeDrawer}
        >
          {statusToggleError && (
            <div className="alert-flex">
              <Alert
                type="error"
                description={statusToggleError}
                onClose={handleToggleAlertClose}
                showIcon
                className="items-center"
              />
              <button
                className="icon sm alert-close"
                onClick={handleToggleAlertClose}
              ></button>
            </div>
          )}
          <span>{`Do you really want to  ${
            selection?.[0]?.status?.toLowerCase() === "active"
              ? "deactivate?"
              : "activate?"
          }`}</span>
          <div className="text-end mt-9">
            <CustomButton onClick={closeDrawer}> No</CustomButton>
            <CustomButton
              type="primary"
              className="ml-3.5"
              loading={loading === "status"}
              disabled={loading === "status"}
              onClick={submitStatusToggle}
            >
              {" "}
              Yes
            </CustomButton>
          </div>
        </CommonDrawer>
      )}
      {isDefaultDrawer && (
        <CommonDrawer
          title={`Set as a Default`}
          isOpen={isDefaultDrawer}
          onClose={closeDrawer}
        >
          {statusToggleError && (
            <div className="alert-flex">
              <Alert
                type="error"
                description={statusToggleError}
                onClose={handleToggleAlertClose}
                showIcon
                className="items-center"
              />
              <button
                className="icon sm alert-close"
                onClick={handleToggleAlertClose}
              ></button>
            </div>
          )}
          <span>{`Do you really want to set as a Default?`}</span>
          <div className="text-end mt-9">
            <CustomButton onClick={closeDrawer}> No</CustomButton>
            <CustomButton
              type="primary"
              className="ml-3.5"
              loading={loading === "default"}
              disabled={loading === "default"}
              onClick={submitDefault}
            >
              {" "}
              Yes
            </CustomButton>
          </div>
        </CommonDrawer>
      )}
      <div className="md:w-[80%]">
        <Outlet />
      </div>
    </div>
  );
};

export default List;
