import { useParams } from 'react-router';
import PayoutTransaction from './payout.details';
import FaitSummary from './summary';
import Success from './success';
import FiatForm from './fiat';
import CryptoAddForm from './cryptoAddForm';
import RecentActivity from './recent.transactions';
import { useSelector } from 'react-redux';
import KycKybPayments from './kyckybpayments';

const Payout = () => {
  const { mode, currencyType } = useParams();
  const userProfile = useSelector((info) => info.userConfig.details);
  const selectedMerchant = useSelector(
    (storeInfo) => storeInfo?.payoutAccordianReducer?.selectedCryptoVault
  );

  const selectedFiatCoin = useSelector(
    (storeInfo) => storeInfo?.payoutAccordianReducer?.selectedFiatCoin
  );

  const selectedCryptoCoin = useSelector(
    (storeInfo) => storeInfo?.payoutAccordianReducer?.selectedCryptoCoin
  );

  const accountType = userProfile?.accountType?.toLowerCase();

  //Crypto Add allowed for business accounts if sender is approved (boolean true)
  const isCryptoAddAllowed =
    mode === 'add' &&
    currencyType === 'crypto' &&
    (selectedMerchant?.providerStatus === 'Approved' || selectedMerchant?.providerStatus === 'Pending');

  //Crypto Add allowed for personal accounts
  const isPersonalCryptoAdd =
    mode === 'add' && currencyType === 'crypto' && accountType === 'personal' && selectedMerchant?.isPayoutCryptoAvailable && (selectedMerchant?.providerStatus === 'Approved' || selectedMerchant?.providerStatus === 'Pending');

  //Show Recent Activity (fiat always OR crypto + business + providerStatus Approved)
  const showRecentActivity =
    (currencyType === 'fiat' && selectedFiatCoin?.isPayoutFiatAvailable) ||
    (currencyType === 'crypto' &&
      selectedMerchant?.isPayoutCryptoAvailable &&
      selectedMerchant?.providerStatus === 'Approved');

  return (
    <>
      {/* Fiat Add */}
      {mode === 'add' && currencyType === 'fiat' && <FiatForm />}

      {/* Crypto Add / KYC-KYB - Business merchants */}
      {mode === 'add' && currencyType === 'crypto' && accountType !== 'personal' && (
        isCryptoAddAllowed ? <CryptoAddForm /> : <KycKybPayments />
      )}

      {/* Crypto Add - Personal accounts */}
      {mode === 'add' && currencyType === 'crypto' && accountType === 'personal' && (
        isPersonalCryptoAdd ? <CryptoAddForm /> : <KycKybPayments />
      )}
      {/* {isPersonalCryptoAdd && <CryptoAddForm />} */}

      {/* Other modes */}
      {mode === 'view' && <PayoutTransaction />}
      {mode === 'summary' && <FaitSummary />}
      {mode === 'success' && <Success />}

      {/* Recent Activity */}
      {showRecentActivity && (
        <div className="mt-4 mb-4">
          <RecentActivity actionType={currencyType} mode={mode} />
        </div>
      )}
    </>
  );
};

export default Payout;
