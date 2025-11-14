import { memo } from "react";
import TransactionGrid from "../recent.transactions";
const WithdrawTransactions = () => {
  return <TransactionGrid url={`banks/withdraw/transactions`} />;
};

export default memo(WithdrawTransactions);
