import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StaticPreviewPayin } from '../../httpServices';
import ContentLoader from '../../../../core/skeleton/common.page.loader/content.loader';
import AppAlert from '../../../../core/shared/appAlert';
import moment from 'moment';
import AppDefaults from '../../../../utils/app.config';

const StaticPreview = ({ data, hideCopyIcon, hideShareOptions, hideNote, hidePaymentLink, selectedPayinWallet }) => {
    const [staticPerviewDetails, setStaticPerviewDetails] = useState({});
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState(null);
    const userProfile = useSelector((store) => store?.userConfig.details);
    useEffect(() => {
        if (data) {
            const payload = {
                "merchantId": selectedPayinWallet?.wallet?.id,
                "currency": selectedPayinWallet?.merchant?.code,
                "networkName": selectedPayinWallet?.code,
                "customerWalletId": selectedPayinWallet?.customerWalletId,
                "merchantName": selectedPayinWallet?.wallet?.name,
                "orderId": data?.orderId,
                "amount": data?.amount,
                "dueDate": moment(data.dueDate)?.format(AppDefaults.formats.standredUTCDate),
                "invoiceType": 'PaymentLink'
            };
            StaticPreviewPayin(setStaticPerviewDetails, setError, setLoader, payload);
        }
    }, [data]);
    const hideElement = () => {
        const container = document.querySelector('.template-style');
        if (hideNote) {
            const noteElement = container.querySelector('p:contains("Note :")');
            if (noteElement) noteElement.style.display = 'none';
        }
        if (hidePaymentLink) {
            const paymentLinkElement = container.querySelector('p#copyPaymentLink');
            if (paymentLinkElement) paymentLinkElement.parentElement.style.display = 'none';
        }
        if (hideShareOptions) {
            const shareSection = container.querySelector('p:contains("Share it on")');
            if (shareSection) shareSection.parentElement.style.display = 'none';
        }
    }

    useEffect(() => {
        if (!loader && staticPerviewDetails?.renderedTemplate) {
            hideElement();
        }
    }, [loader, staticPerviewDetails, hideNote, hidePaymentLink, hideShareOptions]);

    const clearErrorMessage = () => {
        setError(null);
    };

    // Function to remove the copy icons (both for Static and Payment Link)
    const cleanTemplate = (template) => {
        // Regex to remove the copy icon (static preview and payment link)
        const cleanedTemplate = template
            .replace(/<img[^>]*src="https:\/\/devdottstoragespace\.blob\.core\.windows\.net\/arthaimages\/copy_icon\.svg"[^>]*>/g, "")  // Remove the copy icon (static)
            .replace(/<img[^>]*src="https:\/\/devdottstoragespace\.blob\.core\.windows\.net\/arthaimages\/copy_icon\.svg"[^>]*onclick="copyPaymentLink"[^>]*>/g, "")  // Remove the copy icon (payment link)
            .replace(/<img[^>]*src="https:\/\/devdottstoragespace\.blob\.core\.windows\.net\/arthaimages\/copy_icon\.svg"[^>]*onclick="[^"]*"[^>]*>/g, "");  // Remove any copy icon with onclick handler

        return cleanedTemplate;
    };

    return (
        <div className="max-md:w-full max-md:overflow-x-auto template-style mt-9">
            {loader && <ContentLoader />}
            {error && (
                <div className="alert-flex" style={{ width: "100%" }}>
                    <AppAlert
                        className="w-100"
                        type="warning"
                        description={error}
                        showIcon
                    />
                    <button className="icon sm alert-close" onClick={() => clearErrorMessage()}></button>
                </div>
            )}
            {!loader && staticPerviewDetails?.renderedTemplate && (
                <div
                    dangerouslySetInnerHTML={{
                        __html: cleanTemplate(staticPerviewDetails?.renderedTemplate),
                    }}
                />
            )}
        </div>
    );
};

export default StaticPreview;
