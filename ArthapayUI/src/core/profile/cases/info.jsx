import { Form } from 'antd';
import { NumericFormat } from "react-number-format";

const Info = ({ caseDetails }) => {
  return (
    <div className={"case-ribbon grid  gap-4 mb-7 drop-shadow-sm"}>
      {!caseDetails?.commonModel && <div className="chart-nodata justify-center">
        </div>}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {caseDetails?.commonModel &&
          Object.entries(caseDetails?.commonModel).map(([key, value], idx) => {

            const renderValue = () => {
              if (value === null || value === " " || value === "") {
                return '-';
              } else if (
                isNaN(value) ||
                key === 'Transaction Id' ||
                key === 'Bank Account number/IBAN' ||
                key === "Bank Account Number/IBAN" ||
                key === 'Bank Name' ||
                key === "Wallet Address"
              ) {
                if (key === 'Name') {
                  return <>{value}</>;
                } else {
                  return value;
                }
              } else {
                return <NumericFormat value={value} decimalSeparator="." displayType={'text'} thousandSeparator={false} />;
              }
            };

            return (
              <div key={key}>
                <Form.Item name='commonModel' className='m-0'>
                  <div>
                    <div className="ribbon-item flex items-center gap-4">
                      <span className={`icon ${key.toLowerCase()}-icon`}></span>
                      <div className="">
                        <p className='mb-0 profile-label'>{key}</p>
                        <div className='mb-0 profile-value' style={{ width: "30", wordBreak: "break-all" }}>
                          {renderValue()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Form.Item>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

export default Info;
