import { Outlet, useParams } from "react-router"
import FiatDetails from "./depositFiat/fiat.currency.view"
import WithdrawFiat from "./withdraw.components/fiat.withdraw"
import RecentActivityFait from "./depositFiat/recentActivity"

function Fiat() {
    const { actionType } = useParams()
    return (
        <>
            {actionType === 'deposit' && <FiatDetails />}
            {actionType === 'withdraw' && <WithdrawFiat />}
       </>
    )
}

export default Fiat