import { useMemo, useState } from 'react';
import { RenderCounter } from '../MainApp/RenderCounter';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [showDone, setShowDone] = useState(true);

  return (
    <RenderCounter>
      <Input config={{ isDark, setIsDark, showDone, setShowDone }} />
      <TodoList showDone={showDone} isDark={isDark} />
    </RenderCounter>
  );
}

// Hooks Components -----------------------------
function TodoList(props: { isDark: boolean; showDone: boolean }) {
  const { showDone, isDark } = props;
  const { todos, setLength, refresh } = useTodos();
  const filteredTodos = useMemo(() => slowFilterTodos(todos, showDone), [todos, showDone]);

  return (
    <RenderCounter>
      <input
        type='number'
        value={todos.length}
        onChange={(e) => {
          setLength(parseInt(e.target.value));
        }}
      />
      <button onClick={refresh}>Regenerate todos (SLOW)</button>
      <div>{todos.length} Todos:</div>
      <ul style={{ backgroundColor: isDark ? 'black' : undefined }}>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>{todo.isDone ? <s>{todo.text}</s> : todo.text}</li>
        ))}
      </ul>
    </RenderCounter>
  );
}

// A custom hook combining useState and useMemo.
function useTodos() {
  const [length, setLength] = useState(10);
  const [dirtyBit, setDirtyBit] = useState(false);
  const todos = useMemo(() => createTodos(length), [length, dirtyBit]);

  return { todos, setLength, refresh: () => setDirtyBit(!dirtyBit) };
}

// Pure component, no hooks ----------------------------
function Input(props: {
  config: {
    isDark: boolean;
    setIsDark: (isNewDark: boolean) => void;
    showDone: boolean;
    setShowDone: (newShowDone: boolean) => void;
  };
}) {
  const { isDark, setIsDark, showDone, setShowDone } = props.config;

  return (
    <RenderCounter>
      <label>
        <input type='checkbox' checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
        Show Completed (SLOW)
        <br />
        Filtering is artificially slowed down.
      </label>
      <br />
      <br />
      <label>
        <input type='checkbox' checked={isDark} onChange={(e) => setIsDark(e.target.checked)} />
        Dark Mode (FAST)
        <br />
        Rerendering is fast because filtered todos are memoized.
      </label>
    </RenderCounter>
  );
}

// Todo List -----------------------------
type TodoItem = {
  id: number;
  text: string;
  isDone: boolean;
};

const createTodos = (length: number) => {
  console.log(`Creating ${length} new todos.`);

  return Array.from({ length }, (_, i) => ({
    id: i,
    text: 'Todo ' + (i + 1),
    isDone: Math.random() > 0.5,
  }));
};

function slowFilterTodos(todos: TodoItem[], showDone: boolean) {
  console.log(
    `[ARTIFICIALLY SLOW] Filtering ${todos.length} todos ${
      showDone ? 'with' : 'without'
    } completed items.`
  );
  let startTime = performance.now();
  while (performance.now() - startTime < 500) {
    // Do nothing for 500 ms to emulate extremely slow code
  }

  return todos.filter((todo) => showDone || !todo.isDone);
}
