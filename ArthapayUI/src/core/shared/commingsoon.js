import { Image } from "antd";
import commingSoon from '../../assets/images/comming-soon.svg'
function ComingSoon() {
  return (
    <div className="commigsoon flex justify-center items-center h-[50vh] text-center transform translate-y-50 py-9">
      <div className="">
        <Image src={commingSoon} preview={false} width={200} className="mx-auto" alt="commingsoon" />
        <h1 className='comming-text md:text-[42px] text-5xl font-bold mb-0 leading-normal text-textPrimary'>Coming Soon</h1>
        <p className='text-summaryLabelGrey text-lg font-normal w-4/5 m-auto'>We’re hard at work crafting an amazing experience for you. Stay tuned for updates and get ready to explore something incredible.
        </p>
      </div>
    </div>
  )
}
export default ComingSoon
