import poTransactionsImg from "../../assets/images/transaction-img.png";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useCallback } from "react";
const NoTransactionsSection = () => {
  const navigate = useNavigate()
  const applyCards = useCallback(() => {
    navigate(`/cards/apply`)
  }, [navigate])
  return (
    <div className="kpicardbg p-5 rounded-lg">
      <h4 className="text-lg font-semibold text-titleColor">No Transactions yet</h4>
      <div className="flex flex-row items-center mt-4">
        <p className="text-base text-subTextColor text-left">
          Once you start sending or receiving payments, this is where you’ll see them
        </p>
        <img
          src={poTransactionsImg}
          alt="Po Transactions Placeholder"
          className="w-32 mb-4"
        />
      </div>
      <Link
        onClick={applyCards}
        className="text-primaryColor font-semibold mt-4"
      >
        Apply for Card
      </Link>
    </div>
  );
};

export default NoTransactionsSection;