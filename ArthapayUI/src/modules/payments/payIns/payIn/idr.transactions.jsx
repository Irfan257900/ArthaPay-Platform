import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentLinks, setErrorMessages } from "../../reducers/payin.reducer";
import ContentLoader from "../../../../core/skeleton/common.page.loader/content.loader";
import AppAlert from "../../../../core/shared/appAlert";

const IdrTransactions = ({ invoiceData: selectedPaymentLink }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const { loading, data, error } = useSelector((state) => state.payinstore.paymentLinkDetails);

    useEffect(() => {
        if (selectedPaymentLink?.id) {
            dispatch(getPaymentLinks({ id: selectedPaymentLink?.id }));
        }
    }, [selectedPaymentLink?.id, dispatch]);

    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                textArea.setSelectionRange(0, 99999);
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    const updateIcon = (icon) => {
        if (icon) {
            icon.src = "https://devtstarthaone.blob.core.windows.net/arthaimages/check.svg";
            setTimeout(() => {
                icon.src = "https://devtstarthaone.blob.core.windows.net/arthaimages/copy_icon.svg";
            }, 1000);
        }
    };

    const handleClick = (event) => {
        const target = event.target;
        if (target.closest("#copyStatic")) {
            const pElement = target.closest("p");
            const address = pElement?.childNodes[0]?.textContent?.trim(); // text before icon
            if (address) {
                copyToClipboard(address);
                const icon = pElement.querySelector("img");
                updateIcon(icon);
            }
        }

        if (target.closest("#copyPaymentLink")) {
            const pElement = target.closest("p");
            const link = pElement?.childNodes[0]?.textContent?.trim(); // text before icon
            if (link) {
                copyToClipboard(link);
                const icon = pElement.querySelector("img");
                updateIcon(icon);
            }
        }
    };

    const updateWhatsAppLink = (whatsappLink, paymentLink) => {
        if (whatsappLink && paymentLink) {
            const message = `
Hello, I would like to share my ${selectedPaymentLink?.currency} transaction.
Please make sure you are using the correct protocol otherwise you are risking losing the funds.
I am using Payment Gateway: ${paymentLink}
Thank you.`;
            whatsappLink.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
        }
    };

    const updateEmailLink = (emailLink, paymentLink) => {
        if (emailLink && paymentLink) {
            const subject = "Wallet Address";
            const body = `
Hello, I would like to share my ${selectedPaymentLink?.currency} transaction.
Please make sure you are using the correct protocol otherwise you are risking losing the funds.
I am using Payment Gateway:
Link: ${paymentLink}
Thank you.`;
            emailLink.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    };

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const inlineOnClickElements = content.querySelectorAll("[onclick]");
        inlineOnClickElements.forEach((el) => el.removeAttribute("onclick"));

        const pElements = Array.from(content.querySelectorAll("p"));
        const paymentLinkElement = pElements.find(p => {
            const text = p.textContent.trim();
            return text.startsWith("https://tstpayments.rapidz.money/") ||
                text.match(/^https?:\/\/.+/); // fallback: any URL pattern, adjust as needed
        });

        const paymentLink = paymentLinkElement?.textContent.trim() || "";

        // Select WhatsApp and Email anchor by href attributes
        const whatsappLink = content.querySelector("a[href='https://wa.me/']");
        const emailLink = content.querySelector("a[href^='mailto:']");

        updateWhatsAppLink(whatsappLink, paymentLink);
        updateEmailLink(emailLink, paymentLink);

        content.addEventListener("click", handleClick);

        return () => {
            content.removeEventListener("click", handleClick);
        };
    }, [data, selectedPaymentLink]);

    const clearErrorMessage = useCallback(() => {
        dispatch(setErrorMessages([{ key: "preview", message: "" }]));
    }, [dispatch]);

    return (
        <div>
            {error && (
                <div className="alert-flex" style={{ width: "100%" }}>
                    <AppAlert
                        className="w-100 "
                        type="warning"
                        description={error}
                        showIcon
                    />
                    <button className="icon sm alert-close" onClick={clearErrorMessage}></button>
                </div>
            )}
            {loading && <ContentLoader />}
            {(!loading && data?.renderedTemplate) && (
                <div className="max-md:w-full max-md:overflow-x-auto template-style !mt-8">
                    <div
                        ref={contentRef}
                        dangerouslySetInnerHTML={{
                            __html: data?.renderedTemplate,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default IdrTransactions;
