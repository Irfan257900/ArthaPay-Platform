import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import { getSelctorLU, getTypeLU } from '../http.services';
import { useDispatch, useSelector } from 'react-redux';
import { setSelector, setType } from '../../../reducers/banks.reducer';
const { Option } = Select;

const AdditionalInfo = () => {
    const dispatch = useDispatch();
    const handleselectorChange = (value) => {
        dispatch(setSelector(value));
    };
    const handlechangetype = (value) => {
        dispatch(setType(value));
    };

    const [selector, setSelectorLu] = useState([]);
    const [type, setTypeLu] = useState([]);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        fetchSelectorLu();
        fetchTypeLu();
    }, []);

    const fetchSelectorLu = async () => {
        await getSelctorLU(setSelectorLu, setIsError);
    };
    const fetchTypeLu = async () => {
        await getTypeLU(setTypeLu, setIsError);
    };

    return (
            <div>
                <h1 className="text-xl font-semibold mb-4 mt-5">Additional Info</h1>
                <div className="grid md:grid-cols-2 gap-5">
                    <Form.Item
                        label="Sector"
                        name="selector"
                        rules={[{ required: true, message: 'Is required' }]}
                        className="custom-select-float mb-0"
                        colon={false}
                    >
                        <Select
                            showSearch
                            placeholder="Select a Sector"
                            onChange={handleselectorChange}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {selector.map((item) => (
                                <Option key={item.code} value={item.code}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Type"
                        name="type"
                        rules={[{ required: true, message: 'Is required' }]}
                        className="custom-select-float mb-0"
                        colon={false}
                    >
                        <Select
                            showSearch
                            placeholder="Select a Type"
                            onChange={handlechangetype}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {type.map((item) => (
                                <Option key={item.code} value={item.code}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
            </div>
    );
};

export default AdditionalInfo;