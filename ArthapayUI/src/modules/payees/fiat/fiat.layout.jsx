import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import AppAlert from "../../../core/shared/appAlert";
import { message } from "antd";
import { fetchFiatPayees, resetState, setErrorMessages } from "../../../reducers/payees.reducer";
import AppDefaults from "../../../utils/app.config";
import { replaceExtraSpaces } from "../../../core/shared/validations";
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { ItemDescription, WARNING_MESSAGES, selectTabs } from "../service";
import PayeeActions from "../payee.actions";
import EnableOrDisable from "../enableOrDisable";
import CommonDrawer from "../../../core/shared/drawer";
import { PayeesFiatLoader } from '../../../core/skeleton/rightboxskel';
import AppEmpty from "../../../core/shared/appEmpty";
import ScreenTabs from "../../../core/shared/screenTabs";
import Overview from "../overview";
const pageSize = 10;
const badgeColors = {
  'Approved': '!text-paidApproved !border !border-paidApproved',
  'Submitted': '!text-submiteted !border !border-submiteted',
  'Processed': '!text-notPaid !border !border-notPaid',
  'Rejected': '!text-canceled !border !border-canceled',
  'Inactive': '!text-canceled !border !border-canceled',
  'Active': '!text-paidApproved !border !border-paidApproved'
}
const List = (props) => {
  const { mode, name, type, step } = useParams();
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();
  const fiatPayees = useSelector((store) => store.payeeStore?.fiatPayees);
  const payoutPayee = useSelector((store)=>store.payeeStore?.payoutPayee);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPayin, setSelectedPayin] = useState(fiatPayees?.data?.[0]);
  const [warning, setWarning] = useState(null);
  const { pathname } = useLocation();
  const [enableOrDisableModal, setEnableOrDisableModal] = useState(false)
  // const [payeeDetails,setPayeeDetails]=useState(null);

  useEffect(() => {
    fetchPayees(1, null);
    return () => {
      props.dispatch(resetState(['fiatPayees']))
    }
  }, []);

  const navigateToDashboard = () => {
    navigate('/payees')
  }

  const breadCrumbList = useMemo(() => {
    if (mode === "add") {
      return [
        { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
        { id: "2", title: type === 'fiat' ? "Fiat" : "Crypto" },
        { id: "3", title: "Add Payee Fiat" }]
    }
    else if (mode === "edit") {
      return [
        { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
        { id: "2", title: type === 'fiat' ? "Fiat" : "Crypto" },
        { id: "3", title: 'Edit' },
        { id: "4", title: name }
      ]
    }
    else if (step === 'success') {
      return [
        { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
        { id: "2", title: type === 'fiat' ? "Fiat" : "Crypto" },
        { id: "3", title: "Success" }]
    }
    else if (mode === "view") {
      return [
        { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
        { id: "2", title: type === 'fiat' ? "Fiat" : "Crypto" },
        { id: "3", title: name }
      ]
    }
    return [
      { id: "1", title: "Payees", handleClick: () => navigateToDashboard() },
      { id: "2", title: type === 'fiat' ? "Fiat" : "Crypto" }
    ];

  }, [mode, name, type, step]);
  useEffect(() => {
    if (
      fiatPayees?.data &&
      fiatPayees?.data.length > 0 &&
      fiatPayees?.nextPage !== 1
    ) {
      handlePayeeSelection(fiatPayees?.data[0], "");
    }
  }, [fiatPayees?.data]);
  useEffect(() => {
    if (pathname == '/payees/fiat') {
      if (
        fiatPayees?.data &&
        fiatPayees?.data.length > 0 &&
        fiatPayees?.nextPage !== 1
      ) {
        handlePayeeSelection(fiatPayees?.data[0], "");
        return;
      }
    }
  }, [pathname]);
  const fetchPayees = useCallback((page, data, search) => {
    setPage(page)
    const parameters = {
      pageNo: page,
      pageSize: pageSize,
      data: data,
      search: search || null,
    };
    props?.dispatch(fetchFiatPayees(parameters));
  }, [props?.userConfig, pageSize, props?.dispatch]);

  const handlePayeeSelection = (payee, action) => {
    warning && setWarning("");
    setSelectedPayin(payee)
    if ((step === "success" || mode === "add") && action !== "click") {
      return;
    }
     let navigationUrl;
    if(urlParams.get("stableCoinPayout")=== 'true' && action !== "click" ){
        navigationUrl= `/payees/fiat/${payoutPayee?.id}/${payoutPayee?.favoriteName}/edit?stableCoinPayout=true`
    }else if (payee) {
      warning && setWarning("");
      navigationUrl = `/payees/fiat/${payee?.id}/${payee?.favoriteName}/view`;
    } else {
      warning && setWarning("");
      navigationUrl = `/payees/fiat/${AppDefaults.GUID_ID}/new/add`;
    }
    navigate(navigationUrl);
  };
  const onPayeeSearch = useCallback((value) => {
    value = replaceExtraSpaces(value);
    setSearchInput(value);
    fetchPayees(1, null, value);
  }, []);

  const handleTabChange = useCallback((selectedTab) => {
    if (selectedTab === "Crypto") {
      navigate(`/payees/crypto`);
    }
  }, []);
  const navigateToPayeeView = useCallback(() => {
    if (selectedPayin?.id && selectedPayin?.favoriteName) {
      navigate(`/payees/fiat/${selectedPayin?.id}/${selectedPayin?.favoriteName}/view`);
    }
    else {
      navigate(`/payees/fiat`);
    }
  }, [selectedPayin]);

  const handleAddPayeeFiat = useCallback(() => {
    warning && setWarning("");
    navigate(`/payees/fiat/${AppDefaults.GUID_ID}/new/add`);
  }, [warning, AppDefaults]);
  const handleItemSelect = useCallback((item) => handlePayeeSelection(item, 'click'), []);
  const ItemRow = useCallback(({ data, handleListModalClose }) => {
    const hasBgState = data?.status !== 'Active';
    return (
      <ListDetailLayout.ListItem
        data={data}
        itemFields={{
          id: "id",
          title: "favoriteName",
          logo: "logo",
          status: "state",
          activeField: 'status',
        }}
        hasLogo={false}
        hasBgState={hasBgState}
        badgeColor={badgeColors}
        selectedRow={selectedPayin}
        onItemSelect={handleItemSelect}
        module={"payees"}
        handleListModalClose={handleListModalClose}
        hasStatusBadge={true}
        ItemDescription={<ItemDescription data={data} />}>
        <span className="text-xs font-medium text-summaryLabelGrey">
          {data?.amount?.toLocaleString()} {data?.amount}
        </span>
      </ListDetailLayout.ListItem>
    );
  }, [badgeColors, selectedPayin, handleItemSelect]);
  const handlePayeeEdit = useCallback(() => {
    const state = selectedPayin?.state?.toLowerCase();
    const status = selectedPayin?.status?.toLowerCase();
    if (state === 'approved') {
      setWarning(WARNING_MESSAGES[state]);
    }
    else if (status === 'inactive') {
      setWarning(WARNING_MESSAGES[status]);
      return;
    } else {
      warning && setWarning("");
      navigate(`/payees/${type}/${selectedPayin?.id}/${selectedPayin?.favoriteName}/edit`);
    }
  }, [selectedPayin, WARNING_MESSAGES]);

  const onEnableOrDisable = useCallback(() => {
    setEnableOrDisableModal(false);
    setSelectedPayin((prev) => ({ ...prev, status: selectedPayin?.status === 'Active' ? 'Inactive' : 'Active' }))
    message.success({
      content: `Payee ${selectedPayin?.status === 'Active' ? 'deactivated' : 'activated'} successfully.`,
      className: "custom-msg",
      duration: 3,
    })
  }, [selectedPayin]);
  const handlePayeeStatusModalActions = useCallback((payload) => {
    const state = selectedPayin?.state?.toLowerCase();
    if (state === 'submitted' && payload) {
      setWarning(WARNING_MESSAGES[state])
      return;
    }
    setEnableOrDisableModal(!enableOrDisableModal);
  }, [selectedPayin, WARNING_MESSAGES, enableOrDisableModal]);
  const onDrawerClose = useCallback(() => {
    warning && setWarning("");
    setEnableOrDisableModal(false);
  }, [warning]);
  const ClearWarning = useCallback(() => {
    setWarning(null);
    props?.dispatch(setErrorMessages([{ key: 'fiatPayees', message: "" }]));
  }, [props?.dispatch]);

  const renderViewHeader = () => {
    const titleName = selectedPayin?.favoriteName ? `${selectedPayin?.favoriteName?.[0]?.toUpperCase()}${selectedPayin?.favoriteName?.substring(1)}` : '';
     const hasBgState = selectedPayin?.status !== 'Active';
    if (mode === 'view') {
      return (
        <div>
          <div className="flex justify-between items-start ">
            <ListDetailLayout.ViewHeader
              logoType="custom"
              logo={<span>{selectedPayin?.favoriteName?.[0]?.toUpperCase()}</span>}
              title={titleName}
              showActions={false}
              metaData={selectedPayin?.currency}
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
                activeTab="Fiat"
                selectedPayee={selectedPayin}
              />
              {/* <CustomButton
                className="btn btn-secondary"
                onClick={navigateToPayeeView}
              > */}
            </div>
          </div>
          <hr className="my-3 border border-cryptoline"></hr>
        </div>
      );
    }
    else if (mode === 'edit') {
      return (
        <div>
          <div className={`items-start mb-5 ${mode === 'edit' && "block" || " flex"}`}>
            <ListDetailLayout.ViewHeader
              logoType="custom"
              customLogoClass=""
              title={mode === 'edit' && 'Edit Fiat'}
              showActions={false}
              hasLogo={true}
              logoBg={""}
              logo={<button onClick={navigateToPayeeView}><span className="icon lg btn-arrow-back"></span></button>}
              headerCustomClass={"flex1 justify-between"}
            />
          </div>
          <hr className="my-3 border border-cryptoline"></hr>
        </div>
      );
    } else if (mode === 'add') {
      return (
        <div className={`items-start mb-5 ${mode === 'add' && "block" || " flex"}`}>
          <ListDetailLayout.ViewHeader
            logoType="custom"
            hasLogo={true}
            title={mode === 'add' && 'Add Fiat'}
            showActions={false}
            logoBg={""}
            customLogoClass=""
            logo={<button type="button" onClick={navigateToPayeeView}><span className="icon lg btn-arrow-back"></span></button>}
            headerCustomClass={"flex1 justify-between"}
          />
          <hr className="my-3 border border-cryptoline"></hr>
        </div>
      );
    }
    else {
      return (!fiatPayees?.error && !warning) ? <AppEmpty /> : <></>;
    }
  };
  const fetchNextPage = useCallback(
    (pageToFetch) => {
      fetchPayees(pageToFetch + 1, fiatPayees?.data)
    },
    [fiatPayees?.data, page]
  );
  return (<>
    <ListDetailLayout
      breadCrumbList={breadCrumbList}
      ListComponentTitle={"Select payee"}
      hasOverview={true}
      Overview={
        <Overview />
      }
      ListHeader={
        <div className="flex justify-between !p-3 mt-2">
          <div className="toggle-btn custom-tabs">
            <ScreenTabs
              onChange={handleTabChange}
              activeKey={selectTabs}
              className="custom-crypto-tabs"
            />
          </div>
          <ListDetailLayout.ListHeader title="Payees" onAdd={handleAddPayeeFiat} activeTab="Fiat" />
        </div>
      }
      ListComponent={
        <ListDetailLayout.List
          list={fiatPayees?.data || []}
          ItemComponent={ItemRow}
          onSearch={onPayeeSearch}
          onSearchInput={setSearchInput}
          showAlert={fiatPayees?.error !== ""}
          alterMessage={fiatPayees?.error}
          searchValue={searchInput}
          pageSize={pageSize}
          currentPage={page}
          fetchNext={fetchNextPage}
          setShowAlert={ClearWarning}
          searchPlaceholer={'Payees'}
          loading={fiatPayees?.loader}
        />
      }
      ViewHeader={renderViewHeader()}
    >
      {(fiatPayees?.error || warning) && (<div className="px-4">
        <div className="alert-flex" style={{ width: "100%" }}>
          <AppAlert
            className="w-100 "
            type="warning"
            description={fiatPayees?.error || warning}
            showIcon
          />
          <button
            className="icon sm alert-close"
            onClick={ClearWarning}
          ></button>
        </div>
      </div>)}
      {fiatPayees?.loader && !fiatPayees?.data && <PayeesFiatLoader />}
      <Outlet context={fetchPayees} />

    </ListDetailLayout>
    <CommonDrawer
      isOpen={enableOrDisableModal}
      onClose={onDrawerClose}
      title="Confirm"

    >
      <EnableOrDisable payeeType={type} data={selectedPayin} onSuccess={onEnableOrDisable} setShowModal={handlePayeeStatusModalActions} />
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
