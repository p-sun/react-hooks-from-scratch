import { ReactBasics1, ReactBasics2 } from "./ReactBasics";
import { useState } from "react";
const allApps = [ReactBasics1, ReactBasics2];

function Counter(props: { max: number; onChange: (count: number) => void }) {
  const { max, onChange } = props;
  const [count, setCount] = useState(0);
  const goTo = (increment: number) => () => {
    const newCount = (count + increment + max) % max;
    setCount(newCount);
    onChange(newCount);
  };

  return (
    <div>
      <p>Step {count}</p>
      <button onClick={goTo(-1)}>Prev</button>
      <button onClick={goTo(1)}>Next</button>
    </div>
  );
}

export default function HooksApp() {
  const [index, setIndex] = useState(0);

  return (
    <>
      {allApps[index]()}
      <Counter max={allApps.length} onChange={setIndex} />
    </>
  );
}
