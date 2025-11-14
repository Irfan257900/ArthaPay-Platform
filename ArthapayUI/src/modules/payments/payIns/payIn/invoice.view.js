import React, { useEffect } from "react";

const InvoiceView = ({ data, selectedPayin }) => {
  useEffect(() => {
    const copyPaymentLinkInvoice = async () => {
      const paymentLink = document
        .getElementById("paymentLinkInvoice")
        ?.textContent.trim();
      if (paymentLink) {
        try {
          await navigator.clipboard.writeText(paymentLink);
          updateCopyIcon("#copyPaymentLink");
        } catch (error) {
          console.error("Failed to copy text: ", error);
        }
      }
    };

    const copyWalletAddress = async () => {
      const walletAddress = document
        .getElementById("copyWalletInvoive")
        ?.textContent.trim();
      if (walletAddress) {
        try {
          await navigator.clipboard.writeText(walletAddress);
          updateCopyIcon("#copyWalletAddress");
        } catch (error) {
          console.error("Failed to copy wallet address: ", error);
        }
      }
    };

    const updateCopyIcon = (selector) => {
      const icon = document.querySelector(selector);
      if (!icon) return;
      const container = icon.closest(".copy-container");
      if (!container) return;
      container.classList.add("copied");
      setTimeout(() => {
        container.classList.remove("copied");
      }, 2000);
    };

    const content = document.querySelector(".invoice-texts");

    if (content && selectedPayin?.paymentLink) {
      const whatsappLink = content.querySelector("a[href*='https://wa.me/']");
      if (whatsappLink) {
        const message = `
Hello, I would like to share my ${selectedPayin.currency} (${selectedPayin.network}) address for receiving: 
${selectedPayin.walletAddress}
Please make sure you are using the correct protocol otherwise you are risking losing the funds.
I am using Payment Gateway: ${selectedPayin.paymentLink}
Thank you.
        `;
        whatsappLink.href = `https://wa.me/?text=${encodeURIComponent(
          message
        )}`;
      }

      const emailLink = content.querySelector("a[href^='mailto:']");
      if (emailLink) {
        const emailSubject = "Payment Link";
        const emailBody = `
Hello, I would like to share my ${selectedPayin.currency} (${selectedPayin.network}) address for receiving: 
${selectedPayin.walletAddress}
Please make sure you are using the correct protocol otherwise you are risking losing the funds.
I am using Payment Gateway:
Payment Link: ${selectedPayin.paymentLink}
Thank you.`;
        emailLink.href = `mailto:?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(emailBody)}`;
      }
    }

    // 🧼 Remove bad inline handler and attach React-controlled one
    const walletIcon = document.getElementById("copyWalletAddress");
    if (walletIcon) {
      walletIcon.removeAttribute("onclick");
      walletIcon.addEventListener("click", copyWalletAddress);
    }

    const paymentIcon = document.getElementById("copyPaymentLink");
    if (paymentIcon) {
      paymentIcon.removeAttribute("onclick");
      paymentIcon.addEventListener("click", copyPaymentLinkInvoice);
    }

    return () => {
      walletIcon?.removeEventListener("click", copyWalletAddress);
      paymentIcon?.removeEventListener("click", copyPaymentLinkInvoice);
    };
  }, [data, selectedPayin]);

  return (
    <div className="invoice-texts overflow-auto mt-3">
      <div
        dangerouslySetInnerHTML={{
          __html: data,
        }}
      />
    </div>
  );
};

export default InvoiceView;
