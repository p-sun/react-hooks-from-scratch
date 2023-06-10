import { useRef } from 'react';
import { RenderCounter } from '../MainApp/RenderCounter';
import { useRef_ } from './HooksFromScratch';

export default function App() {
  return (
    <>
      Real useRef:
      <UseRefCounter />
      Reimplemented useRef:
      <MyUseRefCounter />
    </>
  );
}

function UseRefCounter() {
  let myBtn = useRef(null as HTMLButtonElement | null);
  let counter = useRef(0);
  return Component(myBtn, counter);
}

function MyUseRefCounter() {
  let myBtn = useRef_(null as HTMLButtonElement | null);
  let counter = useRef_(0);
  return Component(myBtn, counter);
}

function Component(myBtn: { current: HTMLButtonElement | null }, counter: { current: number }) {
  const handleA = () => {
    if (myBtn.current) {
      myBtn.current.click();
    }
  };

  const handleB = () => {
    counter.current += 1;
    if (myBtn.current) {
      myBtn.current.innerText = 'ButtonB: I was clicked ' + counter.current + 'x!';
    }
  };

  return (
    <RenderCounter>
      <button onClick={handleA}>ButtonA: Click ButtonB by ref</button>
      <br />
      <button ref={myBtn} onClick={handleB}>
        ButtonB
      </button>
    </RenderCounter>
  );
}
