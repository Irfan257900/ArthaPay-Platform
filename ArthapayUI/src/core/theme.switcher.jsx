import React, { useCallback, useState } from 'react'
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import useDarkSide from '../hooks/useDarkMode'
function Switcher() {
    const [colorTheme, setTheme] = useDarkSide();
    const [darkSide, setDarkSide] = useState(
      colorTheme === "light" ? true : false
    );
  
    const toggleDarkMode = useCallback((checked) => {
      setTheme(colorTheme);
      setDarkSide(checked);
    },[colorTheme]);
    return (
        <div>
            <DarkModeSwitch 
            className="mx-auto md:my-0"
            moonColor="var(--primaryColor)"
            sunColor="var(--primaryColor)"
            style={{ marginBottom: "0" }}
            checked={darkSide}
            onChange={toggleDarkMode}
            size={24}
            />
        </div>
    )
}

export default Switcher