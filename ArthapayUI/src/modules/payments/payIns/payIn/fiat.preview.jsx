import { useSelector } from "react-redux";
import AppAlert from "../../../../core/shared/appAlert";
import ContentLoader from "../../../../core/skeleton/common.page.loader/content.loader";
import AppEmpty from "../../../../core/shared/appEmpty";

const FiatPreview = () => {
    // Get preview loading, error, and data from Redux store
    const { loading: previewLoading, error: previewError, data: previewData } = useSelector((state) => state.payinstore.preview);

    return (
        <div className="max-md:w-full max-md:overflow-x-auto template-style mt-9">
            {previewLoading && <ContentLoader />}
            {previewError && (
                <div className="alert-flex" style={{ width: "100%" }}>
                    <AppAlert
                        className="w-100"
                        type="warning"
                        description={previewError}
                        showIcon
                    />
                </div>
            )}
            {!previewLoading && previewData?.renderedTemplate && (
                <div
                    dangerouslySetInnerHTML={{
                        __html: previewData.renderedTemplate,
                    }}
                />
            )}
            {
                (!previewLoading && !previewData?.renderedTemplate) &&  <AppEmpty/>
            }
        </div>
    );
};

export default FiatPreview;