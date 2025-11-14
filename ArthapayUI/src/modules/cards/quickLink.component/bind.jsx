import { Modal,Image, Form } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getKycSampleUrls,quickLinkpost } from "../httpServices";
import CustomButton from '../../../core/button/button';
import ActionController from '../../../core/onboarding/action.controller';
import FileUpload from '../../../core/shared/file.upload';
import { successToaster } from '../../../core/shared/toasters';
import { NumericFormat } from 'react-number-format';
import { alphaNumWithUnderscore } from "../../../core/shared/validations";
import { useParams } from "react-router";
import { encryptAES } from "../../../core/shared/encrypt.decrypt";
const Bind = ({setIsProcessEnable,selectedCardName,selectedCardId,selectedCard,setError}) => {
  const [form] = Form.useForm();
   const { cardId } = useParams();
  const [btnLoader, setBtnLoader] = useState(false);
  const [fileLists, setFileLists] = useState({ handHoldingIdPhoto: [] });
  const [sampleUrls, setSampleUrls] = useState(null);
  const [isviewOpen, setIsviewOpen] = useState(false);
  const [imageurl, setImageurl] = useState(null);
  const [previewImages, setPreviewImages] = useState({
    handHoldingIdPhoto: "",
  });
  const customInput = useCallback(
    (inputProps) => <input {...inputProps} />,
    []
  );
  const { t } = useTranslation();
  useEffect(() => {
    // as of now we not calling this API in future it may be used. // NOSONAR
    // getSampleUrls(); // NOSONAR
  }, []);
  const isNotEmpty = (obj) => {
    return obj && Object.keys(obj).length > 0;
  };
  const getSampleUrls = async () => { // NOSONAR
    await getKycSampleUrls((res) => setSampleUrls(res), setError);
  };
  const setGetQuickLinkSave = useCallback(
    (response) => {
      if (response) {
        successToaster({content : t('cards.Messages.CARD_APPLY_SUCCESSMESSAGE'),className : "custom-msg",duration : 3})
        setError(null);
        form.resetFields();
        setIsProcessEnable(true);
        setPreviewImages({ handHoldingIdPhoto: "" });
        setFileLists({ handHoldingIdPhoto: [] });
      } else {
        window.scrollTo(0, 0);
        setBtnLoader(false);
        setError(response);
        setIsProcessEnable(false);
      }
    },
    [form]
  );
  const quickLinkSave = useCallback(async () => {
    setBtnLoader(true);
    setError(null);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      let saveObj = {
        physicalCardProgramId: cardId||selectedCard?.[0]?.physicalCardProgramId,
        envelopeNumber: values?.envelopenumber||selectedCard?.[0]?.envelopeNumber,
        cardNumber: (values?.linkcardnumber||selectedCard?.[0]?.cardNumber) && encryptAES(values?.linkcardnumber||selectedCard?.[0]?.cardNumber),
        handHoldingIdPhoto: selectedCard?.[0]?.needPhotoForActiveCard
          ? fileLists?.handHoldingIdPhoto[0]?.response[0]
          : null,
      };
      const urlParams = { obj: saveObj };
      await quickLinkpost(
        setBtnLoader,
        setGetQuickLinkSave,
        setError,
        urlParams
      );
    } catch (error) {
      setBtnLoader(false);
      if (error?.errorFields?.length) {
        setError(null);
      } else {
        setError(error.message);
      }
      window.scrollTo(0, 0);
    }
  }, [fileLists, selectedCardId, form, selectedCard]);

  const handleUploadChange = useCallback(
    (type, { fileList }) => {
      setError(null);
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg"];
      if (fileList[0].size > MAX_FILE_SIZE) {
        setError(t("cards.Messages.FILE_SIZE_EXCEEDS_LIMIT"));
        window.scrollTo(0, 0);
        return;
      }
      const fileName = fileList[0].name;
      const fileNameParts = fileName.split(".");
      if (fileNameParts.length > 2) {
        setError(t("cards.Messages.INVALID_DOUBLE_EXTENSION"));
        window.scrollTo(0, 0);
        return;
      }
      const fileExtension =
        fileNameParts[fileNameParts.length - 1].toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setError("Only PNG, JPG and JPEG file extensions are allowed.");
        window.scrollTo(0, 0);
        return;
      }
      setFileLists((prevFileLists) => ({ ...prevFileLists, [type]: fileList }));
      if (fileList.length > 0) {
        form.setFieldsValue({ name: type, errors: [] });
      }
      const latestFile = fileList[fileList.length - 1];
      if (latestFile && latestFile.status === "done") {
        successToaster({
          content: t("cards.Messages.UPLOAD_SUCCESS"),
          className: "custom-msg",
          duration: 3,
        });
        const imageUrl =
          latestFile.response?.url ||
          latestFile.response?.[0] || 
          URL.createObjectURL(latestFile.originFileObj);
        form.setFieldsValue({ [type]: imageUrl });
        setFileLists((prevFileLists) => ({
          ...prevFileLists,
          [type]: [...fileList],
        }));
        setPreviewImages((prevImages) => ({ ...prevImages, [type]: imageUrl }));
      }
    },
    [t, form, fileLists, previewImages]
  );

  const handleRemove = useCallback(
    (type) => {
      form.setFieldsValue({ [type]: null });
      setFileLists((prevFileLists) => ({
        ...prevFileLists,
        [type]: [],
      }));
      setPreviewImages((prevImages) => ({ ...prevImages, [type]: "" }));
    },
    [form, fileLists, previewImages]
  );
  const viewImage = (type) => {
    let _url = sampleUrls[type];
    setIsviewOpen(true);
    setImageurl(_url);
  };
  const handleCancel = useCallback(() => {
    setIsviewOpen(false);
    setImageurl(null);
  }, []);
  return (
    <>
      <div className="panel-card buy-card card-paddingrm">
        <div className="card-paddingadd view-inner-card mobile-padding">
          <div className="inner-card ">
            <h2 className="text-2xl text-titleColor font-semibold">
              {t("cards.bindCard.What_is_the_quick_card_linking_service")} ?
            </h2>
            <p className="text-sm font-medium mt-2 text-breadcrum mb-4">
              {t("cards.bindCard.content")}
            </p>
            <Form
              form={form}
              onFinish={quickLinkSave}
              scrollToFirstError={true}
              className="mt-7"
            >
              <div className="grid grid-cols-1 basicinfo-form panel-form-items-bg gap-5">
                <Form.Item
                  className="mb-0"
                  name="linkcardnumber"
                  label={t("cards.bindCard.Link_Card_Number")}
                  rules={[
                    { required: true, message: t("cards.Is_required") },
                    {
                      min: 16,
                      max: 16,
                      message: t(
                        "cards.applyCards.Link_Card_Number_Validation"
                      ),
                    },
                  ]}
                  colon={false}
                >
                  <NumericFormat
                    className="custom-input-field outline-0"
                    placeholder={t("cards.bindCard.Link_Card_Number")}
                    maxLength={16}
                    thousandSeparator={false}
                    allowNegative={false}
                    customInput={customInput}
                  />
                </Form.Item>
                {selectedCard?.[0]?.envelopeNoRequired && (
                  <Form.Item
                    className="mb-0"
                    name="envelopenumber"
                    label={t("cards.applyCards.Member_Number")}
                    rules={[
                      { required: true, message: t("cards.Is_required") },
                      {
                        validator: (_, value) => {
                          if (value && !alphaNumWithUnderscore.test(value)) {
                            return Promise.reject(
                              t("cards.applyCards.Member_Number_Validation")
                            );
                          } else {
                            return Promise.resolve();
                          }
                        },
                      },
                    ]}
                    colon={false}
                  >
                    <input
                      className="custom-input-field outline-0"
                      placeholder={t("cards.applyCards.Member_Number")}
                      type="input"
                      maxLength={6}
                    />
                  </Form.Item>
                )}
              </div>
              <div className="mt-4">
              <div className="">
                <p className="mb-0 floating-label">
                  {t("cards.bindCard.Linking_Card_Name")}
                </p>
                <p className=" mb-0 card-name !text-subTextColor">{selectedCardName || "---"}</p>
              </div>
              {selectedCard?.[0]?.needPhotoForActiveCard && (
                <Form.Item
                  name={"handHoldingIdPhoto"}
                  className="payees-input mt-4 mb-4 required-reverse"
                  rules={[
                    {
                      required: selectedCard?.[0]?.needPhotoForActiveCard
                        ? fileLists.handHoldingIdPhoto.length === 0
                        : false,
                      message: selectedCard?.[0]?.needPhotoForActiveCard
                        ? fileLists.handHoldingIdPhoto.length === 0 &&
                          t("cards.Is_required")
                        : "",
                    },
                  ]}
                >
                  <div className="flex items-center justify-between mt-4 gap-4">
                    {" "}
                    <p className="ant-form-item-required floating-label !mb-2">
                      {t("cards.bindCard.Hand_Holding_ID_Photo")} (2MB){" "}
                      <span className="text-requiredRed">
                        {selectedCard?.[0]?.needPhotoForActiveCard
                          ? `*`
                          : ""}
                      </span>
                    </p>
                    {sampleUrls?.atmHoldingIdPhoto && (
                      <a
                        className="!text-primaryColor !text-sm !font-medium m-0"
                        onClick={() => viewImage("atmHoldingIdPhoto")}
                      >
                        {t("cards.applyCards.View_Sample_Image")}
                      </a>
                    )}
                  </div>
                  <FileUpload
                    name="handHoldingIdPhoto"
                    fileList={fileLists.handHoldingIdPhoto}
                    previewImage={previewImages.handHoldingIdPhoto}
                    handleUploadChange={handleUploadChange}
                    handleRemoveImage={handleRemove}
                    isImagesOnly={true}
                  />
                </Form.Item>
              )}
              </div>
              <div className="my-4 rounded-5 border border-dashed border-StrokeColor bg-tabletdBghover p-4">
                <h2 className="text-2xl text-titleColor font-semibold">
                  {" "}
                  {t("cards.bindCard.Instructions")}
                </h2>
                <div>
                  <h2 className="text-sm font-semibold text-breadcrum mb-3">
                    {t("cards.bindCard.Quick_card_linking_Instructions")}:
                  </h2>
                  <li className="text-sm font-normal text-breadcrum mb-2">
                    {" "}
                    1.{" "}
                    {t(
                      "cards.bindCard.No_fee_is_charged_for_the_quick_card_linking_service_and_it_cannot_be_changed_once_the_linking_is_successful"
                    )}
                  </li>
                  <li className="text-sm font-normal text-breadcrum">
                    {" "}
                    2. {t("cards.bindCard.The_mailer_number_is_unique")}
                  </li>
                </div>
              </div>
              <div className="my-16">
                <ActionController
                  handlerType="button"
                  onAction={quickLinkSave}
                  actionFrom="Cards"
                  buttonType="primary"
                  buttonClass={
                    "rounded-5 border-0 bg-primaryColor hover:!bg-buttonActiveBg dark:hover:!bg-buttonActiveBg text-sm font-medium !text-textBlack w-full uppercase disabled:!bg-btnDisabled disabled:cursor-not-allowed disabled:text-textBlack h-14 focus:none"
                  }
                  loading={btnLoader}
                  disabled={!isNotEmpty(selectedCard?.[0])}
                  redirectTo="/cards/bindcard"
                >
                  <span>{t("cards.assignCard.Submit")}</span>
                </ActionController>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <Modal
        visible={isviewOpen}
        closable={true}
        onCancel={handleCancel}
        centered
        className="custom-modal cust-popup topup-modal"
        title={
          <h1 className="text-2xl text-titleColor font-semibold">
            {t("cards.applyCards.Preview")}{" "}
          </h1>
        }
        destroyOnClose
        closeIcon={
          <button onClick={handleCancel}>
            <span className="icon lg close cursor-pointer" title="close"></span>
          </button>
        }
        footer={false}
      >
        <div className="modal-wcontent text-center">
          <Image
            src={imageurl}
            alt=""
            preview={false}
            className="custom-preview-image"
          />
          <div className="flex items-center justify-end">
            <CustomButton
              block
              className="outlined-btn payee-popup pop-btn mt-16"
              onClick={handleCancel}
            >
              {t("cards.applyCards.close")}
            </CustomButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Bind;
