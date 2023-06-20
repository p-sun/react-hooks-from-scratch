import { ProductsList } from '../Pages/ProductsList';
import { ReactBasics1, ReactBasics2 } from '../Pages/ReactBasics';
import { useState } from 'react';
import Hooks1UseState from '../Pages/Hooks1UseState';
import Hooks2UseRef from '../Pages/Hooks2UseRef';
import Hooks2UseRefStopWatch from '../Pages/Hooks2UseRefStopwatch';
import Hooks3UseMemo from '../Pages/Hooks3UseMemo';
import Hooks3UseMemoTodo from '../Pages/Hooks3UseMemoToDoList';
import SudokuGame from '../Sudoku/SudokuGame';
import WebGLTriangle from '../WebGL/WebGLTriangle';

type Page = {
  title: string;
  description?: string;
  component: () => JSX.Element;
};

const pages: Page[] = [
  {
    title: 'WebGL Triangle',
    description: 'A vertex and fragment shader written in WebGL',
    component: WebGLTriangle,
  },
  { title: 'Sudoku', component: SudokuGame },
  {
    title: 'Hooks - useState',
    description: `Each component has two useStates. When either state is updated, the component re-renders.
    Bottom is an reimplementation of useState. Note we only track state
      for one component in this example, whereas React would attach an array of states
      to each component that calls useState.`,
    component: Hooks1UseState,
  },
  {
    title: 'Hooks - useRef',
    description: `ButtonA presses ButtonB. When ButtonB is pressed, it updates its text to
    count how many times it was clicked.`,
    component: Hooks2UseRef,
  },
  {
    title: 'Hooks - Todo List with Hooks',
    description: ``,
    component: Hooks3UseMemoTodo,
  },
  {
    title: 'Hooks - useMemo',
    description: ``,
    component: Hooks3UseMemo,
  },

  {
    title: 'Combining Hooks - Stopwatch',
    description: `Use useRef to store the intervalId to stop the stopwatch.`,
    component: Hooks2UseRefStopWatch,
  },
  {
    title: 'ProductsList',
    description: 'A product list where items can be filtered by text or by a checkbox.',
    component: ProductsList,
  },

  {
    title: 'ReactBasics1',
    description: 'A simple React component with two nested children, using JSX.',
    component: ReactBasics1,
  },
  {
    title: 'ReactBasics2',
    description:
      'A simple React component with with two nested children, using React.createElement.',
    component: ReactBasics2,
  },
];

function PrevNextButtons(props: {
  max: number;
  initialIndex: number;
  onChange: (count: number) => void;
}) {
  const { max, initialIndex, onChange } = props;
  const [count, setCount] = useState(initialIndex);

  const goTo = (increment: number) => () => {
    const newCount = count + increment;
    setCount(newCount);
    onChange(newCount);
  };
  const prevButton = (
    <button style={{ zIndex: 1 }} onClick={goTo(-1)}>
      Prev
    </button>
  );
  const nextButton = (
    <button style={{ zIndex: 1 }} onClick={goTo(1)}>
      Next
    </button>
  );
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex' }}>
        {count > 0 && prevButton}
        <div style={{ flexGrow: 1 }}> </div>
        {count < max - 1 && nextButton}
      </div>
      {pageNumber(count)}
    </div>
  );
}

const pageNumber = (count: number) => {
  return (
    <div
      style={{
        textAlign: 'center',
        top: 0,
        position: 'absolute',
        width: '-webkit-fill-available',
        fontSize: 'medium',
      }}
    >
      Page {count}
    </div>
  );
};

export default function MainApp() {
  const [index, setIndex] = useState(0);

  const page = pages[index];
  return (
    <>
      <div style={{ textAlign: 'center', fontSize: 'larger' }}>{page.title}</div>
      <PrevNextButtons max={pages.length} initialIndex={index} onChange={setIndex} />
      <br />
      <page.component key={index} />
      <br />
      <div style={{ textAlign: 'left', fontSize: 'medium' }}>{page.description}</div>
    </>
  );
}
