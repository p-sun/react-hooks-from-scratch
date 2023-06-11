import { useState, useRef } from 'react';
import { RenderCounter } from '../MainApp/RenderCounter';

// From: https://react.dev/reference/react/useRef
export default function Stopwatch() {
  const [startTime, setStartTime] = useState(0);
  const [now, setNow] = useState(0);
  const intervalRef = useRef(null as any);

  function handleStart() {
    setStartTime(Date.now());
    setNow(Date.now());

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 80);
  }

  function handleStop() {
    clearInterval(intervalRef.current);
  }

  let secondsPassed = (now - startTime) / 1000;
  return (
    <RenderCounter>
      <h1>Time passed: {secondsPassed.toFixed(3)}</h1>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </RenderCounter>
  );
}
