import { decryptAES } from "../../../core/shared/encrypt.decrypt";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader"

const IbanDetails=({state})=>{
    return(
        <div>
               {state.bankDetailsLoader && <ContentLoader />}
            {!state.bankDetailsLoader && state.bankDetails  && 
              <div className="transaction-details transaction-details mt-2.5">
                <div className="">
                  <div className="summary-list-item">
                    <div className=" summary-label">
                      Bank Name
                    </div>
                    <div className=" summary-text">
                      {state.bankDetails?.bankName || "--"}
                    </div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">
                      BIC
                    </div>
                    <div className=" summary-text">{state.bankDetails?.routingNumber || "--"}</div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">
                      Branch
                    </div>
                    <div className=" summary-text">{state.bankDetails?.branch || "--"}</div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">Country</div>
                    <div className=" summary-text">
                      {state.bankDetails?.country || "--"}
                    </div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">State</div>
                    <div className=" summary-text">{state.bankDetails?.state || "--"}</div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">City</div>
                    <div className=" summary-text">{state.bankDetails?.city || "--"}</div>
                  </div>
                  <div className="summary-list-item">
                    <div className=" summary-label">Zip</div>
                    <div className='summary-text'>
                      {decryptAES(state.bankDetails?.zipCode) || "--"}
                    </div>
                  </div>
                </div>
              </div>}
        </div>
    )
}

export default IbanDetails;