import React from "react";
import errorimg from  "../../assets/images/Fiat.png"
import { Link } from "react-router";
import checkImg from "../../assets/images/check.png";

const FiatSection = () => {
  return (
      <div className="kpicardbg p-5 rounded-lg">
          <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                  <p className="text-lg text-subTextColor mt-2">
                      Step 1 of 3: <br/><Link to="/banks/account/create" className="text-primaryColor font-semibold">Create your<br/> first account </Link><br/>to get started
                  </p>
              </div>
              <div>
                 <img src={errorimg} className='mx-auto' alt='Not Found'></img>
              </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
              {/* <div className="flex items-center space-x-2">
                  <img src={checkImg} alt="Check Icon" className="inline-block h-4 w-4" />
                  <p>Rewards</p>
              </div> */}
              {/* <div className="flex items-center space-x-2">
                  <img src={checkImg} alt="Check Icon" className="inline-block h-4 w-4" />
                  <p>instant</p>
              </div>
              <div className="flex items-center space-x-2">
                  <img src={checkImg} alt="Check Icon" className="inline-block h-4 w-4" />
                  <p>Glo</p>
              </div> */}
          </div>
      </div>
  );
};

export default FiatSection;