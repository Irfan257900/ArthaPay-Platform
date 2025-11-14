import { useState, useEffect, useMemo } from 'react';

const useCountdown = (targetDate) => {
    const countDownDate = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
    const [countDown, setCountDown] = useState(countDownDate - Date.now());
    useEffect(() => {
        const updateCountdown = () => {
            setCountDown(countDownDate - Date.now());
        };
        const interval = setInterval(updateCountdown, 1000);
        return ()=>clearInterval(interval)
    }, [countDownDate]);
    return {...useMemo(() => getReturnValues(countDown), [countDown])};
};

const getReturnValues = (countDown) => {
    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
};

export { useCountdown };
