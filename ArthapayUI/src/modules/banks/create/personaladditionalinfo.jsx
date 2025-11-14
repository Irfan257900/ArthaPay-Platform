import AppDatePicker from "../../../core/shared/appDatePicker";
import { Form } from "antd";
import { validateDOB } from "../../../core/shared/validations";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import moment from "moment";

const PersonalAdditionalInfo = ({ form }) => {
    const KycRequirements = useSelector((store) => store.banks.kycRequirements);

useEffect(() => {
    const dobString = KycRequirements?.data?.kyc?.basic?.dob;
    if (dobString) {
        const parsedDob = moment(dobString);
        if (parsedDob?.isValid()) {
            const currentDob = form.getFieldValue("dob");
            if (!currentDob) {
                form.setFieldsValue({
                    dob: parsedDob,
                });
            }
        }
    }
}, [KycRequirements, form]);

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4 mt-6">Additional Info</h1>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Form.Item
                        label="Date Of Birth"
                        name="dob"
                        rules={[
                            { required: true, message: "Is required" },
                            { validator: validateDOB },
                        ]}
                        className="mb-0"
                    >
                        <AppDatePicker
                            format="DD/MM/YYYY"
                            datesToDisable="futureAndCurrentDates"
                            className="bg-transparent border-[1px] border-inputBg p-2 rounded outline-0 w-full text-lightWhite"
                        />
                    </Form.Item>
                </div>
            </div>
        </div>
    );
};

export default PersonalAdditionalInfo;
