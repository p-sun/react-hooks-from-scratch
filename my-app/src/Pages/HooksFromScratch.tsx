import { useState } from 'react';

/*
* useEffect
* useLayoutEffect
* useRef
* useState
* useCallback
* useMemo

What are these?

A collection of patterns for managing react component state
  By state I mean anything that is not props (meaning is not
    passed in from above)

*/

export function HooksFromScratch() {
  const [on, setOn] = useState(false);
  const [min, setMin] = useState(0);
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
        value={min}
        onChange={(e) => {
          setMin(parseInt(e.target.value));
        }}
      />
      <input
        type='number'
        value={max}
        onChange={(e) => {
          setMax(parseInt(e.target.value));
        }}
      />
      <RandomNumberList min={min} max={max} count={5} showBackgroundColor={on} />
    </div>
  );
}

export function arraysAreEqual(a: any[], b: any[]) {
  if (a.length !== b.length) {
    return false;
  } else {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }
}

function RandomNumberList(props: {
  min: number;
  max: number;
  count: number;
  showBackgroundColor?: boolean;
}) {
  const { min, max, count, showBackgroundColor } = props;

  const { values, refresh } = useRandomNumberArray(min, max, count);
  const name = useWeirdUsername(min, max);

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
        return <div key={index}>{Math.floor(v * 100 + 0.5) / 100}</div>;
      })}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Hooks from scratch                             */
/* -------------------------------------------------------------------------- */
export function useRef_<S>(d: S): { current: S } {
  return useState({ current: d })[0];
}

function useMemo_<T>(valueFn: () => T, deps: any[]) {
  const valuesInfo = useRef_<{ value: T; deps: any[] } | null>(null);
  if (valuesInfo.current === null || !arraysAreEqual(valuesInfo.current.deps, deps)) {
    valuesInfo.current = {
      value: valueFn(),
      deps,
    };
  }

  return valuesInfo.current.value;
}

function useCallback_<T>(fn: () => T, deps: any[]) {
  return useMemo_(() => fn, deps);
}

function useEffect_(fn: () => () => void, deps: any[]) {
  const fnRef = useRef_<{ cleanup: () => void; deps: any[] } | null>(null);
  if (fnRef.current === null || !arraysAreEqual(fnRef.current.deps, deps)) {
    fnRef.current?.cleanup();
    const newCleanup = fn();

    fnRef.current = {
      cleanup: newCleanup,
      deps,
    };
  }
}

// =====================

function getUsername(min: number, max: number): string {
  return 'Bob' + Math.floor(Math.random() * (max - min) + min);
}

function useRandomNumberArray(min: number, max: number, count: number) {
  const [dirtyBit, setDirtyBit] = useState(false);

  const values = useMemo_(
    () =>
      Array.from({ length: count }, () => {
        return Math.random() * (max - min) + min;
      }),
    [min, max, count, dirtyBit]
  );

  return {
    values,
    refresh: () => setDirtyBit(!dirtyBit),
  };
}

function useWeirdUsername(min: number, max: number): string | undefined {
  const [name, setName] = useState('');

  useEffect_(() => {
    const timeoutId = setTimeout(() => {
      setName(getUsername(min, max));
    }, Math.random() * 1000);

    return () => clearTimeout(timeoutId);
  }, [min, max]);

  return name;
}
