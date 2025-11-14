import { useDispatch, useSelector } from "react-redux";
import { fetchPayeeStatusInfo, setErrorMessages } from "../../../reducers/payees.reducer";
import { useCallback, useEffect } from "react";
import AppEmpty from "../../../core/shared/appEmpty";
import CustomButton from "../../../core/button/button";
import SideDrawerLoader from "../../../core/skeleton/drawer.loaders/sidedrawer.loader";

const Providerinfo = ({ selectedPayin, onClose }) => {
    const dispatch = useDispatch();
    const { loading, data, error } = useSelector(state => state.payeeStore?.payeeStatusInfo);
    useEffect(() => {
        if (selectedPayin) {
            dispatch(fetchPayeeStatusInfo(selectedPayin));
        }
    }, [selectedPayin]);
    const clearErrorMsg = useCallback(() => {
        dispatch(setErrorMessages([{ key: 'payeeStatusInfo', message: '' }]))
    }, []);
    return (
        <div>
            {loading && <SideDrawerLoader />}
            {!loading && <>
                {error && <div className="alert-flex mb-24">
                    <AppAlert
                        type="error"
                        description={error}
                        afterClose={clearErrorMsg}
                        closable={true}
                        showIcon
                    />
                </div>}
                {data && Object.keys(data).length > 0 ? (
                    <div className="space-y-5 mt-5">
                        {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="bg-menuhover border border-StrokeColor rounded-5 shadow p-3.5">
                                <div className="font-semibold text-base mb-1 text-subTextColor">{key}</div>
                                <div className="text-sm font-medium text-paraColor">{value}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <AppEmpty />
                )}
                <div className="flex justify-end  mt-6">
                    <CustomButton onClick={onClose} className="md:!min-w-[40px]">Close </CustomButton>
                </div>
            </>}
        </div>
    )
}
export default Providerinfo;