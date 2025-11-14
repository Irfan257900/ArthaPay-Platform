import CopyComponent from "../../../../core/shared/copyComponent";
import { decryptAES } from "../../../../core/shared/encrypt.decrypt";

const ExchangeDetails = ({ details }) => (
    <div>
        <div className="mt-5 p-4 bg-bgblack border border-dashed border-StrokeColor rounded-5  mx-auto w-full mb-7">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-0.5">
                    <h2 className="text-xl font-semibold text-subTextColor">Customer ID</h2>
                </div>
                <div className="flex items-center gap-0.5">
                    <h2 className="text-xl font-semibold text-subTextColor">
                        <CopyComponent text={decryptAES(details[0]?.reference)} shouldTruncate={false} />
                    </h2>
                </div>
            </div>
        </div>
        {details.map((item) => (
            <div className="mb-6" key={item?.id}>
                <div className="mt-5 bg-menuhover border border-StrokeColor dark:border-Borderbr p-3 rounded-5">
                    <h2 className="text-xl font-semibold text-titleColor mb-2 capitalize">{item?.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-labelGrey text-sm font-normal">Bank Account Number / IBAN</p>
                            <p className="text-subTextColor text-sm font-semibold">
                                <CopyComponent text={decryptAES(item?.accountOrIbanNumber)} shouldTruncate={false} />
                            </p>
                        </div>
                        <div>
                            <p className="text-labelGrey text-sm font-normal">Bank Address</p>
                            <p className="text-subTextColor text-sm font-semibold">{item?.address}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                        <div>
                            <h2 className="text-lg font-semibold text-titleColor mb-2 capitalize">For domestic wires</h2>
                            <div>
                                <p className="text-labelGrey text-sm font-normal">Routing Number</p>
                                <p className="text-subTextColor text-sm font-semibold">
                                    <CopyComponent text={item?.routingNumber} shouldTruncate={false} />
                                </p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-titleColor mb-2 capitalize">For international wires</h2>
                            <div className="grid md:grid-cols-1 gap-4">
                                <div>
                                    <p className="text-labelGrey text-sm font-normal">Swift/BIC Code</p>
                                    <p className="text-subTextColor text-sm font-semibold">
                                        <CopyComponent text={item?.swiftOrBicCode} shouldTruncate={false} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
        <div className="mt-6">
            <p className="text-paraColor text-sm font-normal">
                Please choose the currency you would like deposit in, and bank account details for the currency chosen will be
                display. The next step is for you to wire your funds to the bank details provided and remember to include the
                reference number.
            </p>
        </div>
        <div className="mt-4 mb-6">
            <h2 className="text-2xl font-semibold text-titleColor mb-1">Important :</h2>
            <p className="text-paraColor text-sm font-normal">
                Please include your <b>Customer ID </b>that identifies your deposit, and make sure to include this ID in<b>the transaction description or purpose</b> when submitting the wire transfer.
            </p>
        </div>
    </div>
);

export default ExchangeDetails;