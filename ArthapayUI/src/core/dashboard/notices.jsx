import { useSelector } from "react-redux";
import { Carousel } from "antd";
import { useState } from "react";
import CarouselLoader from "../skeleton/carousel.loader";
import CustomButton from "../button/button";
import notices from "../../assets/images/noteImg.png";
import CommonDrawer from "../shared/drawer";

const Notices = () => {
    const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/g, "").trim();
    };

    const noticesInfo = useSelector((store) => store.userConfig.noticeInfo?.data);
    const isLoadingNotices = useSelector((store) => store.userConfig.noticeInfo?.loader);

    const [showNotices, setShowNotices] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState(null);

    const handleClose = () => {
        setShowNotices(false);
    };

    const isLongContent = (html) => stripHtml(html)?.length > 150;

    const handleShowMore = (item) => {
        setDrawerContent(item);
        setDrawerOpen(true);
    };

    const renderNotice = (item) => {
        const showShowMore = isLongContent(item?.content);

        return (
            <div
                key={item?.id}
                className="md:!flex justify-between items-center bg-menuhover dark:bg-cardbackground rounded-5 md:p-6 px-6 py-8 mb-4 "
            >
                <div>
                    <div className="flex items-center gap-4">
                        <div>
                            <img src={notices} alt="Notice" className="w-20" />
                        </div>

                        <div>
                            <h2 className="carousal-title text-xl font-semibold text-lightWhite">
                                {item?.tittle}
                            </h2>

                            <div className="carousal-content font-medium text-subTextColor custom-notices-msg">
                                {showShowMore ? (
                                    <>
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: item?.content.slice(0, 150) + "..."
                                            }}
                                        />
                                        <button
                                            className="text-textPrimary underline-none bg-none border-none p-0 cursor-pointer"
                                            onClick={() => handleShowMore(item)}
                                        >
                                            Show more
                                        </button>
                                    </>
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: item?.content }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <CustomButton
                    className="md:!min-w-[40px]"
                    type="primary"
                    onClick={handleClose}
                >
                    OK
                </CustomButton>
            </div>
        );
    };

    if (!showNotices) return null;

    return (
        <div>
            {isLoadingNotices && <CarouselLoader />}
            {!isLoadingNotices && noticesInfo?.length > 0 && (
                <>
                    {noticesInfo.length > 1 ? (
                        <Carousel autoplay className="notices-slider mb-4">
                            {noticesInfo.map(renderNotice)}
                        </Carousel>
                    ) : (
                        renderNotice(noticesInfo[0])
                    )}
                </>
            )}

            <CommonDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={drawerContent?.tittle}
                width={480}
            >
                <div
                    className="font-medium text-subTextColor dashboarddrawer"
                    dangerouslySetInnerHTML={{ __html: drawerContent?.content }}
                />
                <div className="flex justify-end mt-6">
                    <CustomButton
                        className="md:!min-w-[40px]"
                        type="primary"
                        onClick={() => setDrawerOpen(false)}
                    >
                        Close
                    </CustomButton>
                </div>
            </CommonDrawer>
        </div>
    );
};

export default Notices;
