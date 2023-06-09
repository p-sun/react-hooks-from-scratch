/**
 * Two ways to make a react component tree -- with JSX or with React.createElement.
 */

import React, { useState } from 'react';
import { RenderCounter } from '../MainApp/RenderCounter';

export function ReactBasics1() {
  console.log("(1) ReactBasics1's render");
  const logRef = (r: HTMLDivElement) => {
    console.log("(4) ReactBasics1's ref:");
    console.log(r);
  };
  return (
    <RenderCounter>
      <div ref={logRef}>
        <Toggle labels={['YUP', 'NOPE']} />
        <Toggle labels={['ON', 'OFF']} />
      </div>
    </RenderCounter>
  );
}

// Step 1-4 is the order the code runs in.
// The ref callback occurs after the component has rendered
export function ReactBasics2() {
  console.log("(1) ReactBasics2's render");
  const logRef = (r: HTMLDivElement) => {
    console.log("(4) ReactBasics2's ref:");
    console.log(r);
    /*
       <div style="background-color: cyan;">
          <div>yes</div>
          ‹div>true</div>
       </div>
    */
  };
  return (
    <RenderCounter>
      {React.createElement('div', {
        style: { backgroundColor: 'cyan' },
        ref: logRef,
        children: [
          React.createElement(Toggle, { key: 'a', labels: ['YUP', 'NOPE'] }),
          React.createElement(Toggle, { key: 'b', labels: ['ON', 'OFF'] }),
        ],
      })}
    </RenderCounter>
  );
}

function Toggle(props: { labels: [string, string] }) {
  console.log('(2 & 3 & 5+) Toggle render | labels: ', props.labels);

  const [on, setOn] = useState(true);

  return (
    <button onClick={() => setOn(!on)}>
      {on ? props.labels[0] : props.labels[1]}
    </button>
  );
}
