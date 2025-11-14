import { useEffect, useState } from 'react';
import { invoicePreviewPayin } from '../../httpServices';
import { useSelector } from 'react-redux';
import AppAlert from '../../../../core/shared/appAlert';
import ContentLoader from '../../../../core/skeleton/common.page.loader/content.loader';
import moment from 'moment';
import { encryptAES } from '../../../../core/shared/encrypt.decrypt';
import AppDefaults from '../../../../utils/app.config';

const InvoicePreView = ({ data }) => {
    const [invoicePerviewDetails, setInvoicePerviewDetails] = useState({});
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState(null);
    const userProfile = useSelector((store) => store?.userConfig.details);
    useEffect(() => {
        if (data) {
            const mergedData = {
                ...data,
                customerId: userProfile?.id,
                invoiceType: 'Invoice',
                isCryptoTransfer: true,
                clientWillPayComission: true,
                dueDate: data?.dueDate ? moment(data.dueDate)?.format(AppDefaults.formats.standredUTCDate) : null,
                issuedDate: data?.issuedDate ? moment(data.issuedDate)?.startOf('day')?.format(AppDefaults.formats.standredUTCDate) : null,
                emails: encryptAES(data?.emails),
                taxIdentificationNumber: encryptAES(data?.taxIdentificationNumber),
                zipCode: encryptAES(data?.zipCode),
            };

            invoicePreviewPayin(setInvoicePerviewDetails, setError, setLoader, mergedData);
        }
    }, [data]);

    const clearErrorMessage = () => {
        setError(null);
    };
    const sanitizeTemplate = (htmlString) => {
        if (!htmlString) return htmlString;

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const paymentLinkContainer = Array.from(doc.querySelectorAll('p')).find(
            (p) => p.textContent.trim() === 'Payment Link'
        );
        if (paymentLinkContainer) {
            const parentDiv = paymentLinkContainer.closest('div');
            if (parentDiv) {
                const images = parentDiv.querySelectorAll('img');
                images.forEach((img) => img.remove());
            }
        }
        const walletInvoiceContainer = doc.querySelector('#copyWalletInvoive');
        if (walletInvoiceContainer) {
            const parentDiv = walletInvoiceContainer.closest('div');
            if (parentDiv) {
                const images = parentDiv.querySelectorAll('img');
                images.forEach((img) => img.remove());
            }
        }

        return doc.body.innerHTML;
    };

    return (
        <div className="preview-invoice mt-9">
            {loader && <ContentLoader />}
            {error && (
                <div className="alert-flex" style={{ width: '100%' }}>
                    <AppAlert
                        className="w-100"
                        type="warning"
                        description={error}
                        showIcon
                    />
                    <button
                        className="icon sm alert-close"
                        onClick={() => clearErrorMessage()}
                    ></button>
                </div>
            )}
            {!loader && (
                <div className="invoice-texts overflow-auto mt-3">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: sanitizeTemplate(invoicePerviewDetails?.renderedTemplate),
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default InvoicePreView;
