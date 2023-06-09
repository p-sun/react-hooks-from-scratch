import { useState } from 'react';
import { RenderCounter } from '../MainApp/RenderCounter';

// `useState_` is a fake implementation of useState, to help us understand how it works.
// Only track state for one component in this example, not all components like React.
let _index = -999;
let _allStates: { [nodeId: string]: unknown[] } = {};

export function Hooks1UseStateFake() {
  _allStates = {}; // Set in React infra

  return (
    <RenderCounter>
      <DoubleCounter path='A' />
      <DoubleCounter path='B' />
      <DoubleCounter path='C' />
    </RenderCounter>
  );
}

function DoubleCounter(props: { path: string }) {
  // Only use useState to rerender component
  const [reload, setReload] = useState(false);

  _index = -1; // Set in React infra
  const [count, setCount] = useState_(10, props.path);
  const [count2, setCount2] = useState_(100, props.path);

  const increment1 = () => {
    setCount(count + 1);
    setReload(!reload);
  };
  const increment2 = () => {
    setCount2(count2 + 1);
    setReload(!reload);
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

function useState_<S>(
  initialState: S,
  key: string
): [S, (newState: S) => void] {
  _index++;
  debugger;

  const nodeId = getReactPath(key);
  const currentState = getStateAtReactPath<S>(nodeId, _index);
  const index = _index;
  if (currentState) {
    return [
      currentState.state,
      (newState: S) => setStateAtReactPath(nodeId, index, newState),
    ];
  } else {
    setStateAtReactPath(nodeId, index, initialState);
    return [
      initialState,
      (newState: S) => setStateAtReactPath(nodeId, index, newState),
    ];
  }
}

function getReactPath(path: string): string {
  // Every React node is assigned an id, based on its path in the tree,
  // and any 'key' the user passes in to distinguish it from its siblings.
  return 'MyNodeId-' + path;
}

function getStateAtReactPath<S>(
  nodeId: string,
  index: number
): { state: S } | undefined {
  const state = _allStates[nodeId] && (_allStates[nodeId][index] as S);
  return state ? { state } : undefined;
}

function setStateAtReactPath<S>(nodeId: string, index: number, newState: S) {
  // Mark this node and every parent up the chain as "dirty"

  if (index > (_allStates[nodeId]?.length ?? 0)) {
    throw new Error(
      `Infra error: Failed to set state at index ${index} for ${nodeId}`
    );
  }

  if (_allStates[nodeId] === undefined) {
    _allStates[nodeId] = [newState];
  } else if (index <= _allStates[nodeId].length - 1) {
    _allStates[nodeId][index] = newState;
  } else {
    _allStates[nodeId].push(newState);
  }
}
