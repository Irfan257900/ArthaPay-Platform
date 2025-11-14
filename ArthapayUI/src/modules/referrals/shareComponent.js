import { useTranslation } from "react-i18next";
import CopyComponent from "../../core/shared/copyComponent";
import { Tooltip } from "antd";
import ShareOptions from "../../core/shared/shareOptions";

function ShareComponentHandler({referralId, toggleDropdown}) {
  const referralLink = window.runtimeConfig.VITE_APP_URL;
  const clientName = window.runtimeConfig.VITE_CLIENT_NAME;
  const { t } = useTranslation();

  const getShareText = (baseKey) => {
    if (clientName === "Rapidz Money") {
      return {
        text1: t(`${baseKey}.rapidzText1`),
        text2: t(`${baseKey}.rapidzText2`)
      };
    }else if (clientName === "FastXe") {
      return {
        text1: t(`${baseKey}.fastXeText1`),
        text2: t(`${baseKey}.fastXeText2`)
      };
    }
    return {
      text1: t(`${baseKey}.text1`),
      text2: t(`${baseKey}.text2`)
    };
  };

  const whatsappTexts = getShareText("referrals.share.whatsappshare");
  const telegramTexts = getShareText("referrals.share.telegramShare");
  const emailTexts = getShareText("referrals.share.emailShare");
  const twitterTexts = getShareText("referrals.share.twitterShare");

  const shareConfig = {
    url: referralLink,
    hashtags: [twitterTexts.text2, t("referrals.share.twitterShare.text3")],
    showWhatsapp: true,
    showEmail: true,
    showTwitter: true,
    showTelegram: true,
    twitterTitle: `${twitterTexts.text1}: ${referralId}`,
    whatsappTitle: `${whatsappTexts.text1}: ${referralId}.\n${whatsappTexts.text2}:`,
    emailContent: `${emailTexts.text1}: ${referralId}\n${emailTexts.text2}: `,
    telegramTitle: `${telegramTexts.text1}: ${referralId}. ${telegramTexts.text2}: ${referralLink}`,
    btnBoxClass: "flex justify-center items-center w-14 h-14 border border-blueBorder rounded-full"
  };
  return (
    <div>
      <div className=" absolute md:left-[-10px] left-[-124px] md:top-[5px] md:w-96 border border-StrokeColor  rounded-5  dark:bg-kpcardhover bg-bodyBg ring-1 ring-black ring-opacity-5 z-50 focus:outline-none">
        <div className="p-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg text-lightWhite font-semibold">
              {`${t("referrals.share.share")}`}
            </p>
            <span
              className="icon lg close cursor-pointer"
              title="Close"
              onClick={() => toggleDropdown(false)}
            />
          </div>
          <hr className="border border-StrokeColor" />
          <div className="mt-2 space-y-2">
            <h4 className="font-semibold text-base text-lightWhite text-left">
              {`${t("referrals.share.share_this_Link")}`}
            </h4>
            <ShareOptions shareConfig={shareConfig}/>
          </div>
          {/* <div className="mt-4">
            <p className="mb-2 text-lightWhite font-medium text-base text-left">
              {`${t("referrals.share.copy_link")}`}
            </p>
            <div className="p-2 border border-StrokeColor rounded-sm flex justify-between items-center space-x-2">
              <div className="flex items-center gap-2">
                <div className="icon link-icon cursor-pointer"></div>
                <Tooltip title={referralLink}>
                  <div className='referral-link-ellip'>
                    <CopyComponent
                      text={referralLink || ""}
                      options={{ format: "text/plain" }}
                      shouldTruncate={false}
                      componentClass='flex items-center'
                    >
                      <h4
                        copyable={{ tooltips: ["Copy", "Copied"] }}
                        className="summary-text m-0"
                      >
                        {referralLink || "--"}
                      </h4>
                    </CopyComponent>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default ShareComponentHandler;