import { DatePicker } from 'antd';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';
const MomentDatePicker= DatePicker.generatePicker(momentGenerateConfig);
export default MomentDatePicker;