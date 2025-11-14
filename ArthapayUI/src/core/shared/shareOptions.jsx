import React from 'react';
import { EmailShareButton, TelegramShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import PropTypes from "prop-types";

const ShareOptions = ({ shareConfig }) => {
    const { url, title, hashtags, showWhatsapp = true, showEmail = true, showTwitter = true, showTelegram = true, emailContent, twitterTitle, whatsappTitle, emailSubject, telegramTitle,
        btnBoxClass = 'flex justify-center items-center w-14 h-14 border border-blueBorder rounded-full',
        boxClass = 'share-icon flex items-center space-x-3.5',
        twitterIcon = 'icon lg twitter-icon cursor-pointer',
        emailIcon = 'icon lg email-icon cursor-pointer',
        whatsappIcon = 'icon lg whatsapp-icon cursor-pointer',
        telegramIcon = 'icon lg telegram-icon cursor-pointer'
    } = shareConfig;
    return (
        <div className={`${boxClass}`}>
            <div className={`${btnBoxClass}`}>
                {
                    showTwitter && (
                        <TwitterShareButton
                            className={twitterIcon}
                            url={url}
                            title={twitterTitle || title}
                            hashtags={hashtags}
                        >
                        </TwitterShareButton>
                    )
                }
            </div>
            <div className={`${btnBoxClass}`}>
                {
                    showEmail && (
                        <EmailShareButton
                            className={emailIcon}
                            url={url}
                            subject={emailSubject}
                            body={emailContent}
                        >
                        </EmailShareButton>

                    )
                }
            </div>
            <div className={`${btnBoxClass}`}>
                {showWhatsapp && (
                    <WhatsappShareButton
                        className={whatsappIcon}
                        url={url}
                        title={whatsappTitle || title}
                    >
                    </WhatsappShareButton>
                )
                }
            </div>
            <div className={`${btnBoxClass}`}>
                {showTelegram && (
                    <TelegramShareButton
                        className={telegramIcon}
                        url={url}
                        title={telegramTitle || title}
                    >
                    </TelegramShareButton>
                )
                }
            </div>
        </div>
    )
}

ShareOptions.propTypes = {
    shareConfig: PropTypes.shape({
        url: PropTypes.string,
        title: PropTypes.string,
        hashtags: PropTypes.arrayOf(PropTypes.string),
        showWhatsapp: PropTypes.bool,
        showEmail: PropTypes.bool,
        showTwitter: PropTypes.bool,
        showTelegram: PropTypes.bool,
        twitterTitle: PropTypes.string,
        whatsappTitle: PropTypes.string,
        emailSubject: PropTypes.string,
        emailContent: PropTypes.string,
        telegramTitle: PropTypes.string,
        btnBoxClass: PropTypes.string,
        boxClass: PropTypes.string,
        twitterIcon: PropTypes.string,
        emailIcon: PropTypes.string,
        whatsappIcon: PropTypes.string,
        telegramIcon: PropTypes.string
    })
}

export default ShareOptions