import Moment from "react-moment";
import { convertUTCToLocalTime } from "../../../shared/validations";
import { decryptAES } from "../../../shared/encrypt.decrypt";

const UBOTable = ({ data, onDelete }) => {
  return (
    <div className="overflow-auto">
      <table className="w-full table-style">
        <thead>
          <tr className="bg-transparent border border-StrokeColor rounded-5">
            <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Position</th>
            <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Name</th>
            <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Date Of Birth</th>
            <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Phone Number</th>
            <th className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-paraColor">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((row) => row.recordStatus !== 'deleted')
            .map((row, index) => (
              <tr key={row?.id} className="mt-3 hover:bg-kendotdBghover">
                <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">{row.uboPosition}</td>
                <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">{row.firstName}</td>                
                <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">{row.dob && <Moment format="DD/MM/YYYY">{convertUTCToLocalTime(row.dob)}</Moment>}</td>
                <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">{decryptAES(row.phoneCode)}{" "}{decryptAES(row.phoneNumber)}</td>
                <td className="text-left px-3 py-2 border border-StrokeColor text-sm font-normal text-subTextColor">
                  <div className='flex items-center gap-4'>
                    <span className='icon delete cursor-pointer' onClick={() => onDelete(index)}></span>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
export default UBOTable