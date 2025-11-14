import React, { useEffect } from 'react';
import { useCountdown } from './useCountdown';

const ExpiredNotice = React.memo(() => (
    <div className="expired-notice">
        <span></span>
    </div>
));

const ShowCounter = React.memo(({ days, hours, minutes, seconds }) => {
    return <span className="text-sm font-semibold text-secondary">
        {days > 0 && (
            <>
                {days} <span>{'d '}</span>
            </>
        )}
        {hours > 0 && (
            <>
                {hours} <span>{'h '}</span>
            </>
        )}
        {(hours> 0 || minutes > 0) && (
            <>
                {minutes} <span>{'m '}</span>
            </>
        )}
        {seconds > 0 && (
            <>
                {seconds} <span>{'s'}</span>
            </>
        )}
    </span>

});

const Timer = ({ targetDate, onExpired, textToDisplay, displayInBraces = false }) => {
    const { days, hours, minutes, seconds } = useCountdown(targetDate);

    useEffect(() => {
        const isExpired = days + hours + minutes + seconds <= 0;
        isExpired && onExpired();
    }, [days, hours, minutes, seconds, onExpired]);
    return days + hours + minutes + seconds <= 0 ? (
        <ExpiredNotice />
    ) : (
        <div className="show-counter">
            <div>
                <p className="text-sm font-normal text-lightDark">
                    {textToDisplay}
                    {displayInBraces && <>(<ShowCounter
                        days={days}
                        hours={hours}
                        minutes={minutes}
                        seconds={seconds}
                        textToDisplay={textToDisplay}
                    />)</>}
                    {!displayInBraces && <ShowCounter
                        days={days}
                        hours={hours}
                        minutes={minutes}
                        seconds={seconds}
                        textToDisplay={textToDisplay}
                    />}
                </p>
            </div>
        </div>

    );
};

export default React.memo(Timer);
