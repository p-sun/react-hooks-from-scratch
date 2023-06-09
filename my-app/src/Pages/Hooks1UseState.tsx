import { useState } from 'react';
import { RenderCounter } from '../MainApp/RenderCounter';

export function Hooks1UseState() {
  return (
    <RenderCounter>
      <DoubleCounter />
      <DoubleCounter />
      <DoubleCounter />
    </RenderCounter>
  );
}

// A component with two useStates.
function DoubleCounter() {
  const [count, setCount] = useState(100);
  const [count2, setCount2] = useState(1000);

  const increment1 = () => {
    setCount(count + 1);
  };
  const increment2 = () => {
    setCount2(count2 + 1);
  };
  return (
    <RenderCounter>
      <button onClick={increment1}>+</button>
      <>&nbsp; {count}&nbsp;&nbsp;&nbsp;&nbsp;</>
      <button onClick={increment2}>+</button>
      <>&nbsp; {count2}</>
    </RenderCounter>
  );
}
