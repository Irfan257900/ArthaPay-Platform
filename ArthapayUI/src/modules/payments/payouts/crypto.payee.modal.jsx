import { Modal } from "antd";
import CustomButton from "../../../core/button/button";

const CryptoPayeeModal = ({ showPaymentsPayees, navigateToPayees, onCloseModal }) => {

    return (
        <Modal
            title={
                <span className="text-subTextColor text-xl font-semibold">
                    Note : 
                </span>
            }
            open={showPaymentsPayees}
            closeIcon={
                <button>
                    <span className="icon lg close cursor-pointer" title="close"></span>
                </button>
            }
            footer={[
                <CustomButton
                    key="submit"
                    type="primary"
                    onClick={navigateToPayees}
                >
                    Upload Documents
                </CustomButton>,
            ]}
            onCancel={onCloseModal}
            centered
        >
            <div>
                <div className="mb-4 mt-4">
                    <div className="text-paraColor font-normal custom-modal-text ">
                        To process payments for this payee, please upload the required additional documents.                    </div>
                </div>
            </div>
        </Modal>
    );

}
export default CryptoPayeeModal;