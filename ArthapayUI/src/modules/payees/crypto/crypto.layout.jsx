import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import AppAlert from "../../../core/shared/appAlert";
import { message } from "antd";
import { fetchCryptoPayees, resetState, setCryptoPayeeDetails, setErrorMessages } from "../../../reducers/payees.reducer";
import AppDefaults from "../../../utils/app.config";
import CryptoPayeeLoader from '../../../core/skeleton/rightboxskel';
import { replaceExtraSpaces } from "../../../core/shared/validations";
import { Outlet, useNavigate, useParams, useLocation } from "react-router";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import {
  badgeColors,
  CryptoItemDescription,
  selectTab,
  WARNING_MESSAGES,
} from "../service";
import PayeeActions from "../payee.actions";
import EnableOrDisable from "../enableOrDisable";
import CommonDrawer from "../../../core/shared/drawer";
import AppEmpty from "../../../core/shared/appEmpty";
import ScreenTabs from "../../../core/shared/screenTabs";
import Overview from "../overview";
const pageSize = 10;

const List = (props) => {
  const { mode, name, type, step } = useParams();
  const navigate = useNavigate();
  const cryptoPayees = useSelector(
    (state) => state.payeeStore?.cryptoPayees
  );
  const [searchInput, setSearchInput] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [selectedPayin, setSelectedPayin] = useState(cryptoPayees?.data?.[0]);
  const [warning, setWarning] = useState("");
  const [enableOrDisableModal, setEnableOrDisableModal] = useState(false);
  const [page, setPage] = useState(1);
  const location = useLocation();
  const cryptoPayeeDetails = useSelector((state) => state.payeeStore?.cryptoPayeeDetails);
  useEffect(() => {
    fetchPayees(1, null);
    return () => {
      props.dispatch(resetState(["cryptoPayees"]));
    };
  }, [refresh]);
  function navigateToDashboard() {
    navigate("/payees");
  }
  const breadCrumbList = useMemo(() => {
    if (mode === "add") {
      return [
        { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
        { id: "2", title: type === "fiat" ? "Fiat" : "Crypto" },
        { id: "3", title: "Add Payee Crypto" },
      ];
    } else if (mode === "edit") {
      return [
        { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
        { id: "2", title: type === "fiat" ? "Fiat" : "Crypto" },
        { id: "3", title: "Edit" },
        { id: "4", title: name },
      ];
    } else if (step === "success") {
      return [
        { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
        { id: "2", title: type === "fiat" ? "Fiat" : "Crypto" },
        { id: "3", title: "Success" },
      ];
    }
    else if (mode === "view") {
    return [
      { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
      { id: "2", title: type === "fiat" ? "Fiat" : "Crypto" },
      { id: "3", title: name },
    ];
  }
    return [
      { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
      { id: "2", title: type === "fiat" ? "Fiat" : "Crypto" },
    ];
  }, [mode, name, type, step]);
  useEffect(() => {
    if (
      cryptoPayees?.data &&
      cryptoPayees?.data.length > 0 &&
      cryptoPayees?.nextPage === 2
    ) {
      handlePayeeSelection(cryptoPayees?.data[0], "");
    }
  }, [cryptoPayees]);
    useEffect(() => {
    if (location?.pathname === "/payees/crypto")
      if (
        cryptoPayees?.data &&
        cryptoPayees?.data.length > 0 &&
        cryptoPayees?.nextPage === 2
      ) {
        handlePayeeSelection(cryptoPayees?.data[0], "");
      }
  }, [location]);
  const fetchPayees = (page, data, search) => {
    setPage(page);
    const parameters = {
      id: props?.userConfig?.id,
      pageNo: page,
      pageSize: pageSize,
      data: data,
      search: search || null,
    };
    props?.dispatch(fetchCryptoPayees(parameters));
    setRefresh(false);
  };

  const handlePayeeSelection = (payee, action) => {
    setSelectedPayin(payee);
    if ((step === "success" || mode === "add") && action !== "click") {
      return;
    }
    let navigationUrl;
    if (payee) {
      warning && setWarning("");
      navigationUrl = `/payees/crypto/${payee?.id}/${payee?.favoriteName}/view`;
    } else {
      warning && setWarning("");
      navigationUrl = `/payees/crypto/${AppDefaults.GUID_ID}/new/add`;
    }
    navigate(navigationUrl);
    props.dispatch(setCryptoPayeeDetails(null));
    setWarning("");
  };
  const onPayeeSearch = useCallback((value) => {
    value = replaceExtraSpaces(value);
    setSearchInput(value);
    fetchPayees(1, null, value);
  }, []);

  const handleAddPayeeFiat = useCallback(() => {
    warning && setWarning("");
    navigate(`/payees/crypto/${AppDefaults.GUID_ID}/new/add`);
  }, [warning, AppDefaults]);
  const handleItemSelect = useCallback(
    (item) => handlePayeeSelection(item, "click"),
    []
  );
  const ItemRow = useCallback(
    ({ data, handleListModalClose }) => {
      const hasBgState = data?.status !== 'Active';
      return (
        <ListDetailLayout.ListItem
          data={data}
          itemFields={{
            id: "id",
            title: "favoriteName",
            logo: "logo",
            status: "state",
            activeField:'status',
          }}
          hasLogo={false}
          hasBgState={hasBgState}
          badgeColor={badgeColors}
          selectedRow={selectedPayin}
          module={"payees"}
          onItemSelect={handleItemSelect}
          hasStatusBadge={true}
          handleListModalClose={handleListModalClose}
          ItemDescription={<CryptoItemDescription data={data} />}
        >
          <span className="text-xs font-medium text-summaryLabelGrey">
            {data?.amount?.toLocaleString()} {data?.amount}
          </span>
        </ListDetailLayout.ListItem>
      );
    },
    [badgeColors, selectedPayin, handleItemSelect]
  );
  const handlePayeeEdit = useCallback(() => {
    const state = selectedPayin?.state?.toLowerCase();
    const status = selectedPayin?.status?.toLowerCase();
    if (state === "approved" || state === "rejected") {
      setWarning(WARNING_MESSAGES[state]);
    } else if (status.toLowerCase() === "inactive") {
      setWarning(WARNING_MESSAGES[status]);
      return;
    }else if (state === "submitted" || state === "pending") {
      setWarning(WARNING_MESSAGES[state]); 
    }
    else {
      warning && setWarning("");
      navigate(
        `/payees/${type}/${selectedPayin?.id}/${selectedPayin?.favoriteName}/edit`
      );
    }
  }, [selectedPayin, WARNING_MESSAGES, warning, type]);

  const onEnableOrDisable = useCallback(() => {
    setEnableOrDisableModal(false);
    setRefresh(true);
    setSelectedPayin((prev) => ({
      ...prev,
      status: selectedPayin?.status === "Active" ? "Inactive" : "Active",
    }));
    message.success({
      content: `Payee ${
        selectedPayin?.status === "Active" ? "deactivated" : "activated"
      } successfully.`,
      className: "custom-msg",
      duration: 3,
    });
  }, [selectedPayin]);
  const onDrawerClose = useCallback(() => {
    warning && setWarning("");
    setEnableOrDisableModal(false);
  }, [warning]);
  const handlePayeeStatusModalActions = useCallback(() => {
    const state = selectedPayin?.state?.toLowerCase();
    if (state === "submitted") {
      setWarning(WARNING_MESSAGES[state]);
      return;
    }
    setEnableOrDisableModal(!enableOrDisableModal);
  }, [selectedPayin, WARNING_MESSAGES, enableOrDisableModal]);
  const handleFetchNext = useCallback(
  (pageToFetch) => {
    fetchPayees(pageToFetch + 1, cryptoPayees?.data);
  },
  [cryptoPayees?.data, page]
);

  const handleTabChanging = useCallback((selectedTab) => {
    if (selectedTab === "Fiat") {
      navigate(`/payees/fiat`);
    }
  }, []);
  const navigateToPayeeView = useCallback(() => {
    if((selectedPayin?.id && selectedPayin?.favoriteName) && !cryptoPayeeDetails){
      navigate(`/payees/crypto/${selectedPayin?.id}/${selectedPayin?.favoriteName}/view`);
    }else if((selectedPayin?.id && selectedPayin?.favoriteName) && cryptoPayeeDetails){
      navigate(`/payees/crypto/${selectedPayin?.id}/${selectedPayin?.favoriteName}/edit`);
    }
    else{
      navigate(`/payees/crypto`);
      props.dispatch(setCryptoPayeeDetails(null));
    }
  }, [selectedPayin, cryptoPayeeDetails, props.dispatch]);
    const ClearWarning = useCallback(() => {
      setWarning(null);
      props?.dispatch(setErrorMessages([{key:'cryptoPayees',message:""}]));
    }, [props?.dispatch]);

  const renderViewHeader = () => {
    const titleName = selectedPayin?.favoriteName
      ? `${selectedPayin?.favoriteName?.[0]?.toUpperCase()}${selectedPayin?.favoriteName?.substring(
          1
        )}`
      : "";
    const hasBgState = selectedPayin?.status !== 'Active';
    if (mode === "view") {
      return (
        <div>
          <div className="flex justify-between items-start">
            <ListDetailLayout.ViewHeader
              logoType="custom"
              logo={
                <span>{selectedPayin?.favoriteName?.[0]?.toUpperCase()}</span>
              }
              title={titleName}
              showActions={false}
              metaData={
                <span>
                  {selectedPayin?.currency} ({selectedPayin?.network})
                </span>
              }
              itemFields={{
                id: "id",
                title: "favoriteName",
                logo: "logo",
                status: "state",
                activeField: 'status',
              }}
              data={selectedPayin}
              hasStatusBadge={true}
              hasBgState={hasBgState}
              badgeColor={badgeColors}
              module='payees'
            />
            <div className="flex gap-2">
              <PayeeActions
                status={selectedPayin?.status}
                handlePayeeEdit={handlePayeeEdit}
                handleModalActions={handlePayeeStatusModalActions}
                activeTab="Crypto" 
              />
            </div>
          </div>
          <hr className="my-3 border border-cryptoline"></hr>
        </div>
      );
    } else if (mode === "edit") {
      return (
        <div>
          <div className="flex justify-between items-start mb-5 ">
            <ListDetailLayout.ViewHeader
              logoType="custom"
              customLogoClass=""
              showActions={false}
              hasLogo={true}
              title={mode === "edit" && "Edit Crypto"}
              logoBg={""}
              logo={step !== "success" && <>
                <button onClick={navigateToPayeeView}>
                  <span className="icon lg btn-arrow-back"></span>
                </button>
              </>}
            />
          </div>
          <hr className="my-3 border border-cryptoline"></hr>
        </div>
      );
    } else if (mode === "add") {
      return (
        <div>
          <div
            className={`items-start mb-5 ${
              (mode === "add" && "block") || " flex"
            }`}
          >
            <ListDetailLayout.ViewHeader
              logoType="custom"
              customLogoClass=""
              showActions={false}
              hasLogo={true}
              title={mode === "add" && "Add Crypto"}
              logoBg={""}
              logo={step !== "success" && <>
                <button type="button" onClick={navigateToPayeeView}>
                  <span className="icon lg btn-arrow-back"></span>
                </button>
              </>}
              headerCustomClass={"flex1 justify-between"}
            />
          </div>
          <hr className="my-3 border border-cryptoline"></hr>
        </div>
      );
    }

    return (!cryptoPayees?.error && !warning) ? <AppEmpty /> : <></> ;
  };
  return (
    <>
      <ListDetailLayout
        breadCrumbList={breadCrumbList}
        ListComponentTitle={"Select payee"}
        hasOverview={true}
        Overview={<Overview />}
        ListHeader={
          <div className="flex justify-between !p-3 mt-2">
            <div className="toggle-btn custom-tabs">
              <ScreenTabs
                onChange={handleTabChanging}
                activeKey={selectTab}
                className="custom-crypto-tabs"
              />
            </div>
            <ListDetailLayout.ListHeader
              title="Payees"
              activeTab="Crypto" 
              onAdd={handleAddPayeeFiat}
            />
          </div>
        }
        ListComponent={
          <ListDetailLayout.List
            list={cryptoPayees?.data || []}
            ItemComponent={ItemRow}
            onSearch={onPayeeSearch}
            onSearchInput={setSearchInput}
            showAlert={cryptoPayees?.error !== ""}
            alterMessage={cryptoPayees?.error}
            searchValue={searchInput}
            pageSize={pageSize}
            currentPage={page}
            fetchNext={handleFetchNext}
            setShowAlert={ClearWarning}
            searchPlaceholer={"Payees"}
            loading={cryptoPayees?.loader}
          />
        }
        ViewHeader={renderViewHeader()}
      >
        {(cryptoPayees?.error || warning) && (
          <div className="px-4">
            <div className="alert-flex " style={{ width: "100%" }}>
              <AppAlert
                className="w-100 "
                type="warning"
                description={cryptoPayees?.error || warning}
                showIcon
              />
              <button
                className="icon sm alert-close"
                onClick={ClearWarning}
              ></button>
            </div>
          </div>
        )}
        {cryptoPayees?.loader && !cryptoPayees?.data && <CryptoPayeeLoader />}
        <Outlet context={{ fetchPayees, refresh, setRefresh }} />
      </ListDetailLayout>
      <CommonDrawer
        isOpen={enableOrDisableModal}
        onClose={onDrawerClose}
        title="Confirm"
      >
        <EnableOrDisable
          payeeType={type}
          data={selectedPayin}
          onSuccess={onEnableOrDisable}
          setShowModal={handlePayeeStatusModalActions}
        />
      </CommonDrawer>
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
List.propTypes = {
  userConfig: PropTypes.object,
  dispatch: PropTypes.func,
};
export default connect(connectStateToProps, connectDispatchToProps)(List);
