import moment from "moment";
import { useEffect, useRef, useState } from "react";

export default function useTimer() {
  let timeRef = useRef();
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  function handleStart() {
    const baseTime = moment();

    timeRef.current = setInterval(() => {
      const duration = moment.duration(moment().diff(baseTime));
      setMinutes(duration.minutes());
      setSeconds(duration.seconds());
    }, 1000);
  }

  useEffect(() => {
    return () => clearInterval(timeRef.current);
  }, []);

  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  return {
    text: `${mm}:${ss}`,
    mm,
    ss,
    minutes,
    seconds,
    handleStart,
  };
}
