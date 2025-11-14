import React, { useCallback } from "react";
import MomentDatePicker from "../momentDatePicker";
import AppDefaults from "../../utils/app.config";
import moment from "moment";
const defaultDisableDates = (current, toDisable) => {
  if (!current || current.year() < 1) return true;
  switch (toDisable) {
    case "pastDates":
      return current?.isBefore(moment().startOf("day")) || false;
    case "futureDates":
      return current?.isAfter(moment().endOf("day")) || false;
    case "pastYears":
      return current?.year() < moment().year();
    case "futureYears":
      return current?.year() > moment().year();
    case "pastAndCurrentDates":
      return current?.isSameOrBefore(moment(), "day") || false;
    case "futureAndCurrentDates":
      return current?.isSameOrAfter(moment(), "day") || false;
    case "pastAndCurrentYears":
      return current?.year() <= moment().year() || false;
    case "futureAndCurrentYears":
      return current?.year() >= moment().year() || false;
    default:
      return current?.year() < 1;
  }
};

const AppDatePicker = ({
  value,
  onChange,
  autoComplete = "off",
  format = AppDefaults.formats.date,
  placeholder = AppDefaults.formats.date,
  className = "custom-input-field outline-0 w-full text-lightWhite",
  disableDates = defaultDisableDates,
  datesToDisable = "",
  preventDefaultOnEnter = true,
  disabled = false,
  showTime = false,
  ...otherProps
}) => {
  const disabledDates = useCallback(
    (current) => {
      return disableDates(current, datesToDisable);
    },
    [disableDates, datesToDisable]
  );

  const disabledTime = useCallback(
    (currentDate) => {
      if (showTime && currentDate && currentDate.isSame(moment(), "day")) {
        const currentHour = moment().hour();
        const currentMinute = moment().minute();
        return {
          disabledHours: () =>
            Array.from({ length: 24 }, (_, i) => i).filter(
              (h) => h < currentHour
            ),
          disabledMinutes: (selectedHour) =>
            selectedHour === currentHour
              ? Array.from({ length: 60 }, (_, i) => i).filter(
                  (m) => m < currentMinute
                )
              : [],
        };
      }
      return {};
    },
    [showTime]
  );

  const handleKeyDown = useCallback(
    (e) => {
      preventDefaultOnEnter && e.key === "Enter" && e.preventDefault();
    },
    [preventDefaultOnEnter]
  );

  return (
    <MomentDatePicker
      {...otherProps}
      onKeyDown={handleKeyDown}
      format={format}
      value={value}
      autoComplete={autoComplete}
      disabledDate={disabledDates}
      disabledTime={showTime ? disabledTime : undefined}
      placeholder={placeholder}
      onChange={onChange}
      className={className}
      disabled={disabled}
      showTime={showTime}
    />
  );
};

export default AppDatePicker;