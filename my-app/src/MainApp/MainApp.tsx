import { HooksFromScratch } from '../Pages/HooksFromScratch';
// import { ProductsList } from './ProductsList';
import { ReactBasics1, ReactBasics2 } from '../Pages/ReactBasics';
import { useState } from 'react';
import { Hooks1UseState } from '../Pages/Hooks1UseState';
import { Hooks1UseStateFake } from '../Pages/Hooks1UseStateFake';

type Page = {
  title: string;
  component: () => JSX.Element;
};

const pages: Page[] = [
  { title: 'Hooks - real useState', component: Hooks1UseState },
  { title: 'Hooks - my useState', component: Hooks1UseStateFake },

  { title: 'ReactBasics1', component: ReactBasics1 },
  { title: 'ReactBasics2', component: ReactBasics2 },

  //   { title: 'ProductsList', component: ProductsList },
  { title: 'HooksFromScratch', component: HooksFromScratch },
];

function PrevNextButtons(props: {
  max: number;
  onChange: (count: number) => void;
}) {
  const { max, onChange } = props;
  const [count, setCount] = useState(0);
  const goTo = (increment: number) => () => {
    const newCount = count + increment;
    setCount(newCount);
    onChange(newCount);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex' }}>
        {count > 0 && (
          <button style={{ zIndex: 1 }} onClick={goTo(-1)}>
            Prev
          </button>
        )}
        <div style={{ flexGrow: 1 }}> </div>
        {count < max - 1 && (
          <button style={{ zIndex: 1 }} onClick={goTo(1)}>
            Next
          </button>
        )}
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
      <div style={{ textAlign: 'center', fontSize: 'larger' }}>
        {page.title}
      </div>
      <PrevNextButtons max={pages.length} onChange={setIndex} />
      <br />
      <page.component key={index} />
    </>
  );
}
