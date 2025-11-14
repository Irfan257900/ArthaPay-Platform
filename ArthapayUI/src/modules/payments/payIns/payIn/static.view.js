import React, { useEffect, useRef } from "react";

const StaticView = ({ data, selectedPayin }) => {
  const contentRef = useRef(null);

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
Hello, I would like to share my ${selectedPayin?.currency} (${selectedPayin?.network}) address for receiving: 
${selectedPayin?.walletAddress}
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
Hello, I would like to share my ${selectedPayin?.currency} (${selectedPayin?.network}) address for receiving: 
${selectedPayin?.walletAddress}
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

    // Remove any inline onclick attributes to avoid conflicts
    const inlineOnClickElements = content.querySelectorAll("[onclick]");
    inlineOnClickElements.forEach((el) => el.removeAttribute("onclick"));

    // Extract payment link by scanning <p> elements for a URL pattern (https://tstpayments.rapidz.money/)
    const pElements = Array.from(content.querySelectorAll("p"));
    const paymentLinkElement = pElements.find((p) => {
      const text = p.textContent.trim();
      return text.startsWith("https://tstpayments.rapidz.money/") || text.match(/^https?:\/\/.+/);
    });

    const paymentLink = paymentLinkElement?.textContent.trim() || "";

    // Select WhatsApp and Email anchors by their href attributes
    const whatsappLink = content.querySelector("a[href='https://wa.me/']");
    const emailLink = content.querySelector("a[href^='mailto:']");

    updateWhatsAppLink(whatsappLink, paymentLink);
    updateEmailLink(emailLink, paymentLink);

    content.addEventListener("click", handleClick);

    return () => {
      content.removeEventListener("click", handleClick);
    };
  }, [data, selectedPayin]);

  return (
    <div className="max-md:w-full max-md:overflow-x-auto template-style">
      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: data }}
      />
    </div>
  );
};

export default StaticView;
