import React, { useMemo } from "react";
import { Form, Typography, Table, } from "antd";
import { useSelector, connect, useDispatch } from "react-redux";
import AppAlert from "../../../core/shared/appAlert";
import { NumericFormat } from "react-number-format";
import AppDefaults from "../../../utils/app.config";
import { clearError } from "../reducers/batchPayoutsReducer";
import { useOutletContext } from "react-router";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import { useTranslation } from "react-i18next";
const { Title } = Typography;
const badgeColors = {
  'submitted': "!text-submiteted !border !border-submiteted",
  'approved': "!text-paidApproved !border !border-paidApproved",
  'processed': '!text-notPaid !border !border-notPaid',
  'cancelled': "!text-canceled !border !border-canceled",
  "processing": '!text-notPaid !border !border-notPaid',
}
const Details = (props) => {
  const reducerDispatch = useDispatch();
  const {t} = useTranslation();
  const payoutViewDetails = useSelector((info) => info?.batchPayouts?.paymentViewData);
  const { error } = useOutletContext
  const setErrorMessage = () => {
    reducerDispatch(clearError('paymentViewData'))
  }

  const columns = useMemo(() => [
    {
      title: `${t('payments.batchpayouts.sno')}`,
      dataIndex: 'sno',
      render: (text, record, index) => index + 1,
    },
    {
      title: `${t('payments.batchpayouts.recipientaddress')}`,
      className: 'column-money',
      dataIndex: 'recipientAddress',
      align: 'left',
    },
    {
      title: `${t('payments.batchpayouts.amount')}`,
      dataIndex: 'amount',
      render: (cellprops) => (<td>
        <NumericFormat value={cellprops || 0} displayType="text" thousandSeparator={true} decimalScale={AppDefaults.cryptoDecimals} fixedDecimalScale={AppDefaults.cryptoDecimals} />
      </td>
      )
    },
    {
      title:`${t('payments.batchpayouts.email')}`,
      dataIndex: 'email',
    },
    {
      title: `${t('payments.batchpayouts.recipientname')}`,
      dataIndex: 'recipientName',
    },
    {
      title:`${t('payments.batchpayouts.notes')}`,
      dataIndex: 'entryNote',
    },
  ], [payoutViewDetails.currency]);

  return (<>
    {!payoutViewDetails?.loading && <>
      <div className="dashboard-breadcumb">
      </div>
      {error && (<div className="px-4">
        <div className="alert-flex" style={{ width: "100%" }}>
          <AppAlert
            className="w-100 "
            type="warning"
            description={error}
            showIcon
          />
          <button className="icon sm alert-close" onClick={() => setErrorMessage()}></button>
        </div>
        </div>)}
      {payoutViewDetails?.data && <>
        <div className="panel-card buy-card card-paddingrm">
          <Form
            className=""
          >
            <div className="grid md:grid-cols-4 grid-cols-2 gap-8 p-5 rounded-5 border border-StrokeColor bg-kpcardhover">

              <div>
                <div className="summary-label">{t('payments.batchpayouts.batchname')}</div>
                <div className="summary-text text-left">{payoutViewDetails?.data?.batchName || "--"}</div>
              </div>
              <div>
                <div className="summary-label">{t('payments.batchpayouts.vaultname')}</div>
                <div className="summary-text text-left">{payoutViewDetails?.data?.walletName || "--"}</div>
              </div>
              <div>
                <div className="summary-label">{t('payments.batchpayouts.token')}</div>
                <div className="summary-text text-left">{payoutViewDetails?.data?.currency || "--"}</div>
              </div>
              <div>
                <div className="summary-label">{t('payments.batchpayouts.network')}</div>
                <div className="summary-text text-left">{payoutViewDetails?.data?.network || "--"}</div>
              </div>
              <div>
                <div className="summary-label">{t('payments.batchpayouts.note')}</div>
                <div className="summary-text text-left">{payoutViewDetails?.data?.transactionNote || "--"}</div>
              </div>
              <div>
                <div className="summary-label">{t('common.status')}</div>
                <div className={`rounded-full !p-0.5 w-24 text-center ${badgeColors[payoutViewDetails?.data?.status?.toLowerCase()]||"!text-paidApproved !border !border-paidApproved"}`}>
                  {payoutViewDetails?.data?.status || "---"}</div>
              </div>
            </div>
          </Form>
          <div className="">
            <div className="d-flex align-center justify-content">
              <h2 className='text-large font-semibold text-titleColor my-4 pl-5'>{t('payments.batchpayouts.payeelist')}</h2>

            </div>
            <div className="batch-payeelist-table">
              <Table
                // style={{ minWidth: 800 }}
                className="overflow-auto"
                columns={columns}
                dataSource={payoutViewDetails?.data?.merchantPayees || []}
                bordered
                pagination={false}
              />
            </div>
          </div>
        </div>
      </>}
      {(!payoutViewDetails?.data && !payoutViewDetails?.loading)&&<div className='nodata-content loader-position'>
        <div className='no-data'>
        <img src={darknoData} width={'100px'} alt="" className="dark:block hidden"></img>
        <img src={lightnoData} width={'100px'} alt="" className="dark:hidden block"></img>
          <p className='mb-0 mt-2 text-lightWhite text-sm'>No Data Found</p>
        </div>
      </div>}
    </>}
    {payoutViewDetails?.loading && <ContentLoader />}
  </>
  )
}
const connectStateToProps = ({ userConfig }) => {
  return {
    userConfig: userConfig.details
  }
}
export default connect(connectStateToProps)(Details)
