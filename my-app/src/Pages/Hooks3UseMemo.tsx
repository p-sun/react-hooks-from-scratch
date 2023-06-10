import { useEffect, useMemo, useState } from 'react';

export default function HooksFromScratch() {
  const [on, setOn] = useState(false);
  const [max, setMax] = useState(100);

  return (
    <div>
      <button
        onClick={() => {
          setOn(!on);
        }}
      >
        Background
      </button>
      <input
        type='number'
        value={max}
        onChange={(e) => {
          setMax(parseInt(e.target.value));
        }}
      />
      <RandomNumberList max={max} count={5} showBackgroundColor={on} />
    </div>
  );
}

function RandomNumberList(props: { max: number; count: number; showBackgroundColor?: boolean }) {
  const { max, count, showBackgroundColor } = props;

  const { values, refresh } = useRandomNumberArray(max, count);
  const name = useWeirdUsername(max);

  return (
    <div
      style={{
        marginTop: 12,
        border: '1px solid black',
        padding: 4,
        borderRadius: 4,
        backgroundColor: showBackgroundColor ? '#7fcfff' : undefined,
      }}
    >
      <div style={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>{name ?? '...'}</div>
      {values.map((v, index) => {
        return <div key={index}>{v}</div>;
      })}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}

function getUsername(max: number): string {
  return 'Bob' + Math.floor(Math.random() * max);
}

function useRandomNumberArray(max: number, count: number) {
  const [dirtyBit, setDirtyBit] = useState(false);

  const values = useMemo(() => slowGenerateList(max), [max, count, dirtyBit]);

  return {
    values,
    refresh: () => setDirtyBit(!dirtyBit),
  };
}

function slowGenerateList(max: number) {
  console.log('[ARTIFICIALLY SLOW] Creating new todos.');
  let startTime = performance.now();
  while (performance.now() - startTime < 500) {
    // Do nothing for 500 ms to emulate extremely slow code
  }

  return Array.from({ length: 10 }, () => {
    return `Todo ${Math.round(Math.random() * max)}`;
  });
}

function useWeirdUsername(max: number): string | undefined {
  const [name, setName] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setName(getUsername(max));
    }, Math.random() * 1000);

    return () => clearTimeout(timeoutId);
  }, [max]);

  return name;
}
