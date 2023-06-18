import { useReducer, useMemo, useState, useRef } from 'react';
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

function TodoList(props: { isDark: boolean; showDone: boolean }) {
  const { showDone, isDark } = props;

  const { todos, filteredTodos, length, setLength, refresh, toggleTodo, deleteTodo } =
    useTodos(showDone);

  return (
    <RenderCounter>
      <input
        type='number'
        value={length}
        onChange={(e) => {
          setLength(parseInt(e.target.value));
        }}
      />
      <button onClick={refresh}>Regenerate todos (SLOW)</button>
      <div>{todos.length} Todos:</div>
      <ul style={{ backgroundColor: isDark ? 'black' : undefined }}>
        {filteredTodos.map((todo) => (
          <TodoListItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </ul>
    </RenderCounter>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Custom Hook                                */
/* -------------------------------------------------------------------------- */

function useTodos(showDone: boolean) {
  const lengthRef = useRef(10);
  const length = lengthRef.current;

  const [todos, dispatch] = useReducer(todosReducer, length, createTodos);
  const filteredTodos = useMemo(() => slowFilterTodos(todos, showDone), [todos, showDone]);

  return {
    todos,
    filteredTodos,
    length,
    setLength: (newLength: number) => {
      lengthRef.current = newLength;
      dispatch({ type: 'refresh', length: newLength });
    },
    refresh: () => dispatch({ type: 'refresh', length }),
    deleteTodo: (id: number) => {
      dispatch({ type: 'delete', id });
    },
    toggleTodo: (id: number) => {
      dispatch({ type: 'toggle', id });
    },
  };
}

function todosReducer(
  state: Todo[],
  action:
    | { type: 'refresh'; length: number }
    | { type: 'delete'; id: number }
    | { type: 'toggle'; id: number }
) {
  switch (action.type) {
    case 'refresh':
      return createTodos(action.length);
    case 'delete':
      return state.filter((todo) => todo.id !== action.id);
    case 'toggle':
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, isDone: !todo.isDone } : todo
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                          Pure components, no hooks                         */
/* -------------------------------------------------------------------------- */

function TodoListItem(props: { todo: Todo; onToggle: () => void; onDelete: () => void }) {
  const { todo, onDelete, onToggle } = props;

  const todoText = todo.isDone ? <s>{todo.text}</s> : todo.text;
  return (
    <div key={todo.id} style={{ display: 'flex' }}>
      <li>{todoText}</li>
      <div style={{ flexGrow: 1 }} />
      <button onClick={onToggle}>Toggle</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}

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

/* -------------------------------------------------------------------------- */
/*                               Todo List Model                              */
/* -------------------------------------------------------------------------- */

type Todo = {
  id: number;
  text: string;
  isDone: boolean;
};

const createTodos = (length: number) => {
  console.log(`Creating ${length} new todos.`);

  return Array.from({ length }, (_, i) => ({
    id: i + 1,
    text: 'Todo ' + (i + 1),
    isDone: Math.random() > 0.5,
  }));
};

function slowFilterTodos(todos: Todo[], showDone: boolean) {
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
