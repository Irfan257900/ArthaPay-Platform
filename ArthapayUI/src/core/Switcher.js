import React, { useCallback, useMemo } from 'react'
import useDarkSide from '../hooks/useDarkMode'
import { Input } from 'antd';
function Switcher() {
    const [colorTheme, setTheme] = useDarkSide();
    const isDarkTheme = useMemo(() => {
        return colorTheme === "light"
    }, [colorTheme])
    const toggleDarkMode = useCallback(() => {
        setTheme();
    },[colorTheme]);
    return (
        <div className='text-center'>
            <Input type="checkbox" name="checkbox"
             checked={isDarkTheme}
             onChange={toggleDarkMode}
             className="switch"/>
        </div>
    )
}

export default Switcher