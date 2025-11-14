import { useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import previewimage from "../../assets/images/pdf-dark.svg";
import previewimagelight from "../../assets/images/pdf-light.svg";
import CustomButton from "../button/button";
import AppEmpty from "./appEmpty";
import PlainLoader from "./loaders/plain.loader";
import AppAlert from "./appAlert";

/* Note 
If you face any error related to content security policy, 
Please change the https://unpkg.com/pdfjs-dist url in web.config
such that it should match the "pdfjs.version" used below
*/

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.js",
  import.meta.url
).toString();
export const PdfThumbnail = ({
  rootClass = "h-[184px] flex justify-center items-center",
  imageStyle = { height: "100px" },
  imageClass = "mx-auto",
}) => {
  return (
    <div className={rootClass}>
      <img
        src={previewimage}
        alt="pdfimage"
        className={`${imageClass} hidden dark:block`}
        style={imageStyle}
      />
      <img
        src={previewimagelight}
        alt="pdfimage"
        className={`${imageClass} block dark:hidden`}
        style={imageStyle}
      />
    </div>
  );
};
const PdfPreview = ({
  className = "!h-full !w-full overflow-auto",
  fileUrl,
  documentProps = {},
  pageProps = { renderAnnotationLayer: false, renderTextLayer: false },
}) => {
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setLoading(false);
    setNumPages(numPages);
  }, []);
  const handlePageChange = useCallback(
    (e, acc) => {
      e?.preventDefault?.();
      setPageNumber((prev) => {
        const curr = prev + acc;
        if ((curr >= 1 && acc === -1) || (curr <= numPages && acc === 1)) {
          return curr;
        }
        return prev;
      });
    },
    [numPages]
  );
  return (
    <div className={className}>
      <Document
        {...documentProps}
        error={
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              type="error"
              description={"Failed to load pdf!"}
              showIcon
            />
          </div>
        }
        file={fileUrl}
        loading={
          <PlainLoader className="w-full h-[100%] flex items-center justify-center text-black dark:text-white  text-xl text-center" />
        }
        noData={<AppEmpty description="No Data" />}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {!loading && (
          <Page
            {...pageProps}
            pageNumber={pageNumber}
            loading={
              <PlainLoader className="w-full h-[100%] flex items-center justify-center text-black dark:text-white  text-xl text-center" />
            }
            noData={<AppEmpty description="No Data" />}
          ></Page>
        )}
        {loading && (
          <PlainLoader className="w-full h-[100%] flex items-center justify-center text-black dark:text-white  text-xl text-center" />
        )}
      </Document>
      <div className="mt-4 flex gap-2">
        {pageNumber > 1 && (
          <CustomButton
            disabled={pageNumber === 1}
            className="disabled:cursor-not-allowed"
            type="normal"
            onClick={handlePageChange}
            onClickParams={[-1]}
          >
            Prev
          </CustomButton>
        )}
        <p>
          Page {pageNumber} of {numPages}
        </p>
        {pageNumber < numPages && (
          <CustomButton
            disabled={pageNumber === numPages}
            className="disabled:cursor-not-allowed"
            type="normal"
            onClick={handlePageChange}
            onClickParams={[1]}
          >
            Next
          </CustomButton>
        )}
      </div>
    </div>
  );
};

export default PdfPreview;
