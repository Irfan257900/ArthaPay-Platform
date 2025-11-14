import { useSelector } from "react-redux";
import { Carousel } from "antd";
import { useCallback, useState } from "react";
import CarouselLoader from "../skeleton/carousel.loader";
import CustomButton from "../button/button";
import notices from "../../assets/images/noteImg.png";
import CommonDrawer from "../shared/drawer";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const CombinedNoticesAndCases = () => {
    const noticesInfo = useSelector((store) => store.userConfig.noticeInfo?.data) || [];
    const isLoadingNotices = useSelector((store) => store.userConfig.noticeInfo?.loader);
        const casesInfo = useSelector(
        (store) => store.userConfig.userCasesInfo?.data
    ) || []; 
    const isLoadingCases = useSelector(
        (store) => store.userConfig.userCasesInfo?.loader
    );
        const combinedData = [
        ...noticesInfo?.map(item => ({ ...item, type: 'notice' })),
        ...casesInfo?.map(item => ({ ...item, type: 'case' })),
    ];
    const isLoading = isLoadingNotices || isLoadingCases;
    const [showContent, setShowContent] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerContent, setDrawerContent] = useState(null);
    const navigate = useNavigate();
    
    const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/g, "").trim();
    };

    const isLongContent = (html) => stripHtml(html)?.length > 150;
    
    const handleHideAll = () => {
        setShowContent(false);
    };

    const handleShowMore = (item) => {
        setDrawerContent(item);
        setDrawerOpen(true);
    };
      const { t } = useTranslation();
    
    const handleNavigateToProfile = useCallback((typeId) => {
        navigate(`/support/${typeId}`);
    }, [navigate]);


    const renderItem = (item) => {
        if (item.type === 'notice') {
            const showShowMore = isLongContent(item?.content);
            return (
                <div
                    key={`notice-${item?.id}`}
                    className="md:!flex justify-between items-center bg-menuhover dark:bg-cardbackground rounded-5  p-3  mb-4 "
                >
                    <div>
                        <div className="flex items-center gap-4 p-3">
                            <div>
                                <img src={notices} alt="Notice" className="w-20" />
                            </div>

                            <div>
                                <h2 className="carousal-title text-xl font-semibold text-lightWhite mb-2">
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
                        className="md:!min-w-[40px] mb-6 md"
                        type="primary"
                        onClick={handleHideAll}
                    >
                        OK
                    </CustomButton>
                </div>
            );
        } else if (item.type === 'case') {
            return (
                <div
                    key={`case-${item?.id}`}
                    className="!flex justify-between items-center bg-cardbackground rounded-5 md:p-6 p-3 mb-4 h-[18vh]"
                >
                    <div className="flex items-center gap-2.5">
                        <div>
                            <span className="icon exclamatoryicon cursor-pointer"></span>
                        </div>
                        <div>
                            <h2 className="carousal-title text-lg font-semibold mb-0">
                                {item.title}
                            </h2>
                            <p className="carousal-content font-medium">
                                {item.message}
                            </p>
                        </div>
                    </div>
                    <p className="text-primaryColor cursor-pointer">
                        <CustomButton
                            type="normal"
                            onClick={() => handleNavigateToProfile(item?.typeId)}
                        >
                            {t("dashboard.View details")}
                        </CustomButton>
                    </p>
                </div>
            );
        }
        return null;
    };
    if (!showContent) return null;
    return (
        <div>
            {isLoading && <CarouselLoader />}

            {!isLoading && combinedData.length > 0 && (
                <>
                    {combinedData.length > 1 ? (
                        <Carousel autoplay className="combined-notices-cases-slider mb-4">
                            {combinedData.map(renderItem)}
                        </Carousel>
                    ) : (
                        renderItem(combinedData[0])
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

export default CombinedNoticesAndCases;