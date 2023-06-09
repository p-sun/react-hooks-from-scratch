import { useRef } from 'react';

export function RenderCounter(props: { children: JSX.Element[] | JSX.Element }) {
  const count = useRef(0);
  count.current += 1;
  const h = count.current / 10 + 0.2;
  const color = 'hsl(' + Math.round(h * 255) + ',70%,40%)';
  return (
    <div
      style={{
        backgroundColor: color,
        padding: 8,
        border: '4px solid black',
      }}
    >
      {props.children}
      <div style={{ fontSize: 'medium', color: 'black' }}>Renders: {count.current} </div>
    </div>
  );
}
