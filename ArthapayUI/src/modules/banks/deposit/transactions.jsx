import TransactionGrid from "../recent.transactions";
const DepositTransactions = () => {
  return (
    <TransactionGrid  url={`accounts/deposit/transactions`} />
  );
};

export default DepositTransactions;
