import { Alert } from "antd";
import { connect } from "react-redux";
import { getSelectedAddress } from "../reducers/applyCardReducer";
import { useNavigate, useParams } from "react-router";
import Loader from "../../../core/shared/loader";
import { useCallback, useEffect, useState } from "react";
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import { getAllAddressesDetails } from "../httpServices";
import { deriveErrorMessage } from "../../../core/shared/deriveErrorMessage";


const AllAddresses = (props) => {
    const navigate = useNavigate()
    const params = useParams()
    const [allAddresses, setAllAddresses] = useState([])
    const [loader, setLoader] = useState()
    const [errorMessage, setErrorMessage] = useState(null)
    useEffect(() => {
        getAllAddresses(props?.user?.id)
    }, [props?.user?.id])
    const getAllAddresses = async (id) => {
        try{
            const urlParams = {id:id};
            await getAllAddressesDetails(setLoader,setAllAddresses,setErrorMessage,urlParams)
        }catch(error){
            setErrorMessage(deriveErrorMessage(error)) ;
        }
          
    }
    const selectAddress = (item) => {
        props.dispatch(getSelectedAddress({ data: item }))
        navigate(`/cards/apply/${params?.cardId}/steps`)
    }
    const backtoView = () => {
        navigate(`/cards/apply/${params?.cardId}/steps`)
    }
    const editAddress = (item, mode) => {
        if (mode === "edit") {
            props.dispatch(getSelectedAddress({ data: item }))
            navigate(`/cards/apply/${params?.cardId}/addAddress/${item.id}/edit`);
        }
    }
    const addAddress = () => {
        props.dispatch(getSelectedAddress({ data: null }))
        navigate(`/cards/apply/${params?.cardId}/addAddress/00000000-0000-0000-0000-000000000000/add`);
    }
    const clearErrorMsg = useCallback(()=>{
        setErrorMessage(null)
    },[])
    return (
        <div className="">
                <div className="d-flex align-center"> <span className="icon lg btn-arrow-back cursor-pointer" onClick={() => backtoView()}></span>
                    <span className="card-title card-head">All Addresses</span></div>
                <div>
                    <div className="name-rounded" onClick={() => addAddress()}> <span className="icon sm add-coin c-pointer"></span> </div>
                    <p className="text-center" >Add</p>
                </div>
            <Loader spinning={loader}>
                {errorMessage && (
                    <div className="alert-flex mb-24">
                        <Alert
                            type="error"
                            description={errorMessage}
                            onClose={clearErrorMsg}
                            showIcon
                        />
                        <span className="icon sm alert-close c-pointer" onClick={clearErrorMsg}></span>
                    </div>
                )}
                {allAddresses.map((item) =>
                    <div className="address-bg p-16 mb-16 p-relative c-pointer" key={item?.id}>
                        <div className="d-flex align-center address-box" >
                            <div className="d-flex align-center address-box sm-d-block" onClick={() => selectAddress(item)}>
                                <div className="name-rounded"><span>{item.fullname.charAt(0)?.toUpperCase()}</span></div>
                                <div>
                                    <div className="d-flex align-center" style={{ gap: "8px" }}>
                                        <span className='icon user'></span>
                                        <p className="m-0">{item.fullname || '--'}</p>
                                    </div>
                                    <div className="d-flex align-center" style={{ gap: "8px" }}>
                                        <span className='icon phone'></span>
                                        <p className="m-0">{item?.phoneCode} {item?.phoneNumber} </p>
                                    </div>
                                    <div className="d-flex align-center" style={{ gap: "8px" }}>
                                        <span className='icon location'></span>
                                        <p className="m-0 address-text"> {item.addressLine1}, {item.city}, {item.town}, {item.state}, {item.country} </p>

                                    </div>
                                </div>
                            </div>
                            <div className='text-right edit-address'>
                                <div className="name-rounded" onClick={() => editAddress(item, "edit")}> <span className="icon md edit c-pointer"></span> </div>
                                <p className="pr-12" >Edit</p>
                            </div>
                        </div>
                    </div>)}
                {
                    !allAddresses.length > 0 &&
                    <div className='nodata-content'>
                        <div className='no-data'>
                        <img src={darknoData} width={'100px'} alt="" className="dark:block hidden"></img>
                        <img src={lightnoData} width={'100px'} alt="" className="dark:hidden block"></img>
                            <p className="text-lightWhite text-sm font-medium mt-3">No Data</p>
                        </div>
                    </div>
                }
            </Loader>
        </div>
    )
}
const connectStateToProps = ({ userConfig, applyCard }) => {
    return {
        user: userConfig.details,
        allAddresses: applyCard?.allAddresses
    };
};
export default connect(connectStateToProps)(AllAddresses);
