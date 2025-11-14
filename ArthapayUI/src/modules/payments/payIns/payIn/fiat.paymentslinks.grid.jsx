import { useCallback, useEffect, useState } from "react";
import { Tag, Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import AppInfiniteScroll from "../../../../core/shared/appInfiniteScroll";
import { getPaymentsInvoices, payinInvoiceDwd, payinInvoiceFiatDwd } from "../../httpServices";
import ContentLoader from "../../../../core/skeleton/common.page.loader/content.loader";
import PreviewModal from "../../../../core/shared/previewModal";
import IdrTransactions from "./idr.transactions";
import numberFormatter from "../../../../utils/numberFormatter";
import Moment from "react-moment";
import { convertUTCToLocalTime } from "../../../../core/shared/validations";
import CustomButton from "../../../../core/button/button";
import { successToaster } from "../../../../core/shared/toasters";
import { toasterMessages } from "../payin.constants";
import AppEmpty from "../../../../core/shared/appEmpty";
import { useNavigate } from "react-router";
import CopyComponent from "../../../../core/shared/copyComponent";



const badgeColors = {
  'Paid': "!text-paidApproved",
  'paid': "!text-paidApproved",
  'cancelled': "!text-canceled",
  'Not Paid': '!text-notPaid',
  'Cancelled': '!text-canceled',
  'Expired': "!text-canceled",
  'expired': "!text-canceled",
  'Rejected': "!text-textReject",
  'rejected': "!text-textReject",
  'Partially Paid': "!text-partiallyPaid",
};

const truncateToTwoDecimals = (num) => {
  return Math.floor(num * 100) / 100;
};

const getBalanceText = (amount, type) => {
  if ((!amount || isNaN(amount)) && type === 'payin') {
    return '';
  }
  if (!amount || isNaN(amount)) {
    return "0.00";
  }
  const { number, suffix } = numberFormatter(amount);

  const [integerPart, decimalPart] = number.split('.');

  const formattedInteger = parseFloat(integerPart).toLocaleString(undefined, {
      maximumFractionDigits: 0
  });

  const finalNumber = `${formattedInteger}.${(decimalPart || '00').padEnd(2, '0').substring(0, 2)}`;

  return finalNumber + (suffix || "");
};

// ===== Invoice Item Component =====
export const InvoiceItem = ({ data, handleListModalClose, onDetailsClick }) => {
  if (!data) return null;

  const {
    invoiceNo,
    amount,
    status,
    paymentLink,
    currency,
    expiryDate
  } = data;

  return (
    <div className="">
      <div className="grid grid-cols-2 xl:grid-cols-6 lg:grid-cols-4 gap-4 lg:gap-3  bg-menuhover p-3 mb-3 rounded-5 shadow-sm border border-StrokeColor text-sm">

        {/* Invoice No */}
        <div>
          <p className="text-xs text-paraColor">Invoice No</p>
          <p className="font-medium text-xs">{invoiceNo}</p>
        </div>

        {/* Amount */}
        <div>
          <p className="text-xs text-paraColor">Amount</p>
          <p>
            <span className="font-medium text-xs">
              {getBalanceText(amount)} {currency}
            </span>
          </p>
        </div>

        {/* Expiry Date */}
        <div className="">
          <p className="text-xs text-paraColor">Expiry Date</p>
          <Moment className="!text-xs font-medium " format="DD/MM/YYYY" globalLocal={true}>
            {expiryDate}
          </Moment>
        </div>

        {/* Status */}
        <div className="">
          <p className="text-xs text-paraColor">Status</p>
          <p className={badgeColors[status] || "blue"}><span className="!text-xs">{status}</span></p>
        </div>
        <div className="xl:text-center lg:text-start">
          <Button
            size="small"
            type="link"
            // icon={<LinkOutlined />}
            // href={paymentLink}
            target="_blank"
            onClick={handleListModalClose}
            className="!p-0 !text-xs hover:!text-primaryColor"
          >
            <span className="!text-primaryColor">Copy Link</span>
            <CopyComponent
              text={paymentLink}
              noText=""
              shouldTruncate={false}
              type=""
              className="icon copy-icon cursor-pointer text-primaryColor"
              textClass="text-primaryColor"
            />
          </Button>
        </div>
        {/* Actions */}
        <div className="xl:text-center lg:text-start">

          <Button
            className="!bg-transparent !border !border-primaryColor text-primaryColor text-xs hover:!text-primaryColor detail-btn group"
            size="small"
            onClick={() => onDetailsClick(data)}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};



// ===== Infinite Scroll Wrapper =====
const FiatPaymentsLinksGrid = ({ handleListModalClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loaderDwnd, setLoaderDwnd] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const navigate = useNavigate();

  const pageSize = 10;
  const searchValue = null;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const urlParams = {
      searchValue: searchValue || null,
      pageNo: page,
      pageSize,
    };

    const newData = await getPaymentsInvoices(setLoading, urlParams, setError);

    setData((prev) => [...prev, ...newData]);
    const moreAvailable = newData.length === pageSize;
    setHasMore(moreAvailable);
    if (moreAvailable) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore, page, pageSize]);

  useEffect(() => {
    loadMore(); // load first page
  }, []);

  const handleDetailsClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };



  const setGetdownloadInvoice = (response) => {
    setLoaderDwnd(false);
    const link = document.createElement('a');
    link.href = response;
    link.download = selectedInvoice?.invoiceNo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    successToaster({ content: toasterMessages?.download })
  }



  const invoiceDownload = useCallback(async () => {
    const urlParams = {
      id: selectedInvoice?.id,
      type: selectedInvoice?.type
    }
    await payinInvoiceFiatDwd(setLoaderDwnd, setGetdownloadInvoice, setError, urlParams);
  }, [selectedInvoice, setGetdownloadInvoice]);




  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <div className="mt-5 overflow-auto">
      {
        (data?.length <= 0 && !loading) && <div className='nodata-content loader-position'>
          <AppEmpty description={`It Looks like you dont have any Payments Links yet. Let's genarate one to get started .`} >
            <button
              type="button"
              className="cards secondary-outline !px-6 !py-2 !text-base "
              onClick={() => navigate('/payments/payins/payin/00000000-0000-0000-0000-000000000000/IDR/fiatadd/payments/fiat')}
            >
              Genarate Payment Link  <span className="icon btn-arrow ml-2"></span>
            </button>
          </AppEmpty>
        </div>
      }

      {(data?.length > 0 || !loading) && <div className="custom-grid-scroll"><AppInfiniteScroll
        containerHeight={600}
        ItemComponent={(props) => (
          <div className="scroll-grid">
            <InvoiceItem
              {...props}
              onDetailsClick={handleDetailsClick}
            />
          </div>
        )}
        loading={loading}
        Loader={ContentLoader}
        page={page}
        hasMore={hasMore}
        loadMore={loadMore}
        data={data}
        itemKey="id"
        defaultPage={1}
        handleListModalClose={handleListModalClose}
        // description="No payment links found"
        noDatarequired={false}
      /></div>}
      <PreviewModal
        title={''}
        isModalOpen={isModalOpen}
        onCancel={handleModalClose}
        width={800}
        footer={[
          <CustomButton key="close" onClick={handleModalClose}>
            Close
          </CustomButton>,
          <CustomButton type='primary' onClick={invoiceDownload} loading={loaderDwnd} key="download">
            Download
          </CustomButton>
        ]}
      >
        {selectedInvoice && <IdrTransactions invoiceData={selectedInvoice} />}
      </PreviewModal>
    </div>
  );
};

export default FiatPaymentsLinksGrid;
