import React, { useCallback, useEffect, useState } from "react";
import {
  Col,
  Row,
  Typography,
  Checkbox,
  List,
  Input,
  Tooltip,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { WarningOutlined } from "@ant-design/icons";
import {
  fetchPayees,
  fetchSummary,
  setErrorMessages,
  setSelectedPayee,
} from "../../../reducers/banks.widthdraw.reducer";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
import ActionController from "../../../core/onboarding/action.controller";
import AddPayeeDrawer from "../../../core/shared/addPayee.drawer";
import { AddressItem } from "../service";
import AppAlert from "../../../core/shared/appAlert";
import AppEmpty from "../../../core/shared/appEmpty";
import PaymentsMethods from "../../../core/shared/paymentMethods";

const icon = <WarningOutlined />;
const { Search } = Input;
const { Title } = Typography;

const PayeesSelection = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showData] = useState(false);
  const [searchVal, setSearchVal] = useState([]);
  const [filteredPayees, setFilteredPayees] = useState([]);
  const [showAddPayee, setShowAddPayee] = useState(false);
  const [paymentMethodError, setPaymentMethodError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const { loading: fetchingSummary } = useSelector(
    (state) => state.transferReducer.summary
  );
  const selectedBank = useSelector(
    (store) => store.transferReducer.selectedBank
  );
  const {
    loading: fetchingPayees,
    data: payees,
    error: payeesError,
  } = useSelector((state) => state.transferReducer.payees);
  const selectedCurrency = useSelector(
    (state) => state.transferReducer.selectedCurrency
  );
  const selectionWalletList = useSelector(
    (state) => state?.transferReducer?.accounts?.data?.[0]?.currency
  );
  const selectedPayee = useSelector(
    (state) => state.transferReducer.selectedPayee
  );

  const { bankAmount, currency } = useParams();

  // ------------------------------
  // Fetch Payees when currency changes
  // ------------------------------
  useEffect(() => {
    if (selectedCurrency?.currency) {
      dispatch(fetchPayees({ setFilteredPayees }));
    }
  }, [selectedCurrency?.currency, dispatch]);

  const navigateToPayees = useCallback(() => {
    setShowAddPayee(true);
  }, []);

  const getSelectedAddress = useCallback(
    (data) => {
      dispatch(setSelectedPayee(data));
    },
    [dispatch]
  );


  const handleSearch = (value) => {
    let payeesToFilter;
    const trimmedValue = value?.trim();
    if (!trimmedValue) {
      payeesToFilter = payees;
    } else {
      payeesToFilter = payees.filter((item) =>
        item.favoriteName?.toLowerCase().includes(trimmedValue.toLowerCase())
      );
    }
    setFilteredPayees(payeesToFilter);
  };

  const closeErrorHandler = useCallback(() => {
    dispatch(setErrorMessages([{ key: "payees", message: "" }]));
    setPaymentMethodError('')
  }, [dispatch]);

  const closeDrawerHandler = useCallback(() => {
    setShowAddPayee(false);
  }, []);
  const onPayeeSuccess = useCallback(() => {
    dispatch(fetchPayees({ setFilteredPayees }));
    closeDrawerHandler();
  }, [dispatch, closeDrawerHandler]);

  const handleSearchChange = useCallback(
    ({ currentTarget }) => {
      setSearchVal(currentTarget.value);
      handleSearch(currentTarget.value);
    },
    []
  );

  const handleClick = useCallback(
    (item) => {
      getSelectedAddress(item);
    },
    [getSelectedAddress]
  );

  const renderPayeesAddressItem = useCallback(
    (item) => {
      return (
        <AddressItem
          item={item}
          selectedAddress={selectedPayee}
          onClick={handleClick}
        />
      );
    },
    [selectedPayee, handleClick]
  );
  const getSummary = useCallback(() => {
    setPaymentMethodError("");
    dispatch(
      fetchSummary({
        amount: props.amount,
        onSuccess: () =>
          navigate(
            `/banks/withdraw/${selectedCurrency?.currency}/summary/${bankAmount || props.amount
            }`
          ),
      })
    );
  }, [dispatch, selectedCurrency, props.amount, selectedPaymentMethod, bankAmount, navigate]);

  return (
    <>
      <div className="panel-card buy-card card-paddingrm">
        {(payeesError || paymentMethodError) && (
          <div className="alert-flex mt-0">
            <AppAlert
              type="error"
              description={payeesError || paymentMethodError}
              afterClose={closeErrorHandler}
              icon={icon}
              closable={true}
              showIcon
            />
          </div>
        )}
        <PaymentsMethods
          paymentScheme={selectedCurrency?.paymentScheme}
          screenName="banks"
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          setPaymentMethodError={setPaymentMethodError}
        />
        <p className="border border-StrokeColor p-2.5 rounded-5">
          <strong> Note : </strong> {" "}<span className="text-paraColor"> {selectedBank?.note}</span>
        </p>
        <div className="md:max-w-[465px] mx-auto pt-4 mt-6 bg-menuhover border border-StrokeColor text-lightWhite p-3.5 rounded-5 payess-selection-search">
          {!fetchingPayees && (
            <div className="">
              <div className="flex items-center gap-1">
                <h3 className="text-base font-normal text-titleColor">
                  Select Payee
                </h3>
                <span className="text-textLightRed">*</span>
              </div>
              <div className="coin-search address-search flex items-center gap-2.5">
                <Search
                maxLength={50}
                  value={searchVal}
                  placeholder="Type to search for payee"
                  suffix={<span className="icon md search c-pointer" />}
                  onChange={handleSearchChange}
                  size="middle"
                  bordered={false}
                  className="coin-search-input cursor-pointer"
                />
              </div>
            </div>
          )}
          {fetchingPayees && <ContentLoader />}
          {!fetchingPayees && filteredPayees.length > 0 && (
            <List
              itemLayout="horizontal"
              dataSource={filteredPayees}
              className="selectbank-list dt-topspace pr-2 overflow-y-auto max-h-[300px]"
              renderItem={renderPayeesAddressItem}
            />
          )}
          {!fetchingPayees && filteredPayees.length === 0 && (
            <div>
              <AppEmpty />
            </div>
          )}
          {showData && (
            <div>
              <div className="payee-inblock">
                <div className="agree-details">
                  <Title className="tr-input-title">Recipient Details </Title>
                </div>
                <div className="transfer-right-bor">
                  <Row gutter={[10, 10]}>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">Recipient full name</div>
                        <div className="tr-text"></div>{" "}
                      </div>
                    </Col>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">
                          Recipient phone
                        </div>{" "}
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={[10, 10]}>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">Recipient email</div>
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="payee-inblock">
                <div className="agree-details">
                  <Title className="tr-input-title">Recipient address </Title>
                </div>
                <div className="transfer-right-bor">
                  <Row gutter={[10, 10]}>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">Full address</div>
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">Country</div>
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={[10, 10]}>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">City</div>
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">State</div>
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="payee-inblock">
                <div className="agree-details">
                  <Title className="tr-input-title">
                    Recipient bank Details{" "}
                  </Title>
                </div>
                <div className="transfer-right-bor">
                  <Row gutter={[10, 10]}>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">Bank name</div>
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">Account number/IBAN</div>
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={[10, 10]}>
                    <Col xs={24} md={24} lg={24} xl={24} xxl={24}>
                      <div className="tr-details">
                        {" "}
                        <div className="transfer-lbl ">
                          {" "}
                          Routing number/SWIFT/BIC
                        </div>
                        <div className="tr-text"></div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="text-left check-boxalignment">
                <Checkbox className="agree-text" />
                <Title className="check-text">
                  I agree to Neo's Terms of Service and its return, refund and
                  cancellation policy.
                </Title>
              </div>
            </div>
          )}

        </div>
        {selectedPayee?.id && (
          <div className="text-center mb-9 mt-5">
            <div className="mt-9">
              <ActionController
                handlerType="button"
                onAction={getSummary}
                redirectTo="/banks/withdraw"
                actionFrom="Banks"
                buttonType="primary"
                loading={fetchingSummary}
                disabled={fetchingSummary}
                buttonClass="w-full"
              >
                Continue
              </ActionController>
            </div>
          </div>
        )}
      </div>
      <div>
        <AddPayeeDrawer
          onSuccess={onPayeeSuccess}
          payeeType="fiat"
          isOpen={showAddPayee}
          onClose={closeDrawerHandler}
          onCancel={closeDrawerHandler}
          selectedCoin={selectedCurrency?.currency || selectionWalletList}
        // isBaas={true}
        />
      </div>
    </>
  );
};

export default PayeesSelection;
