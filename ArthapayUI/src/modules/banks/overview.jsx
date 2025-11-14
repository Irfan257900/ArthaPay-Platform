import Kpis from './kpis'
import RecentActivity from './recentActivity'

const Overview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:gap-5 xxl:gap-5 xl:gap-4 gap-4 mb-7">
        <Kpis/>
        <RecentActivity/>
    </div>
  )
}

export default Overview