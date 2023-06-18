import { useEffect, useReducer } from 'react';

export default function SudokuGame() {
  const [gameState, dispatch] = useReducer(sudokuReducer, initialGameState);

  useEffect(() => {
    fetchSudoku().then((problem) => dispatch({ type: 'setProblem', problem }));
  }, []);

  const zeroToNine = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return gameState.grid.length === 0 ? (
    <div />
  ) : (
    <>
      {gameState.difficulty}
      <Board
        gameState={gameState}
        setSelectedPos={(pos) => dispatch({ type: 'setSelectedPos', pos })}
      />
      <br />
      <BoardRow
        row={0}
        gameState={{
          grid: [zeroToNine],
          editable: [Array.from({ length: 10 }, () => false)],
          solution: [zeroToNine],
          selectedPos: undefined,
          difficulty: '',
        }}
        setSelectedPos={(pos) => dispatch({ type: 'setWritableValue', value: pos.col })}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */
const BOARD_CONFIG = {
  minorBorderWidth: 4,
  minorBorderColor: '#b39d86',
  majorBorderWidth: 12,
  majorBorderColor: '#918273',

  boardBackground: '#f5dcc1',
  selectedColor: '#ffe78f',
  nonEditableBGColor: '#e0e0e0',
  errorTextColor: 'red',
};

type Position = { row: number; col: number };
function isEqual(pos1: Position | undefined, pos2: Position | undefined) {
  return pos1?.row === pos2?.row && pos1?.col === pos2?.col;
}

/* -------------------------------------------------------------------------- */
/*                                 Game State                                 */
/* -------------------------------------------------------------------------- */
type GameState = {
  grid: number[][];
  solution: number[][];
  editable: boolean[][];
  selectedPos: Position | undefined;
  difficulty: string;
};

const initialGameState: GameState = {
  grid: [],
  solution: [],
  editable: [],
  difficulty: '',
  selectedPos: undefined,
};

function sudokuReducer(
  state: GameState,
  action:
    | { type: 'setSelectedPos'; pos: Position }
    | { type: 'setProblem'; problem: SudokuProblem }
    | { type: 'setWritableValue'; value: number }
) {
  switch (action.type) {
    case 'setProblem':
      const editable = action.problem.gridProblem.map((row) => row.map((cell) => cell === 0));
      return {
        ...state,
        grid: action.problem.gridProblem,
        editable,
        solution: action.problem.solution,
        difficulty: action.problem.difficulty,
      };
    case 'setSelectedPos':
      const isEditable = state.editable[action.pos.row][action.pos.col];
      const hasChanged = !isEqual(state.selectedPos, action.pos);
      return {
        ...state,
        selectedPos: isEditable && hasChanged ? action.pos : undefined,
      };
    case 'setWritableValue':
      return {
        ...state,
        grid: state.grid.map((row, rowIdx) =>
          row.map((cell, colIdx) =>
            rowIdx === state.selectedPos?.row && colIdx === state.selectedPos?.col
              ? action.value
              : cell
          )
        ),
      };
  }
}

function getCellProps(forState: GameState, at: Position) {
  const { grid, solution, editable, selectedPos } = forState;
  const { row, col } = at;
  const { boardBackground, selectedColor, errorTextColor, nonEditableBGColor } = BOARD_CONFIG;

  const isEditable = editable[row][col];
  const isSelected = selectedPos ? selectedPos.col === col && selectedPos.row === row : false;
  const isIncorrect = solution[row][col] !== grid[row][col];
  const cellBackground = !isEditable
    ? nonEditableBGColor
    : isSelected
    ? selectedColor
    : boardBackground;

  return {
    value: grid[row][col],
    isSelected,
    isEditable,
    isIncorrect,
    cellBackground,
    textColor: !isEditable || !isIncorrect ? 'black' : errorTextColor,
  };
}

/* -------------------------------------------------------------------------- */
/*                              React Components                              */
/* -------------------------------------------------------------------------- */
function Board(props: { gameState: GameState; setSelectedPos: (pos: Position) => void }) {
  const { minorBorderWidth, majorBorderWidth, majorBorderColor, minorBorderColor } = BOARD_CONFIG;
  const { gameState, setSelectedPos } = props;

  return (
    <div style={{ aspectRatio: 1 }}>
      <div
        style={{
          backgroundColor: minorBorderColor,
          display: 'flex',
          flexDirection: 'column',
          gap: minorBorderWidth,
          border: `${majorBorderWidth}px solid ${majorBorderColor}`,
          color: 'black',
        }}
      >
        {Array.from({ length: gameState.grid.length }).map((_, row) => (
          <BoardRow key={row} row={row} gameState={gameState} setSelectedPos={setSelectedPos} />
        ))}
      </div>
    </div>
  );
}

function BoardRow(props: {
  row: number;
  gameState: GameState;
  setSelectedPos: (pos: Position) => void;
}) {
  const { minorBorderWidth } = BOARD_CONFIG;
  const {
    row,
    gameState: { grid },
    setSelectedPos,
  } = props;

  return (
    <div style={{ display: 'flex', gap: minorBorderWidth }}>
      {Array.from({ length: grid[0].length }).map((_, col) => (
        <Cell
          key={col}
          cellProps={getCellProps(props.gameState, { row, col })}
          onClick={() => {
            setSelectedPos({ row, col });
          }}
        />
      ))}
    </div>
  );
}

function Cell(props: {
  cellProps: { value: number; cellBackground: string; textColor: string };
  onClick: () => void;
}) {
  const {
    cellProps: { value, cellBackground, textColor },
    onClick,
  } = props;

  return (
    <div
      style={{
        backgroundColor: cellBackground,
        width: (1 / 9) * 100 + '%',
        aspectRatio: 1,
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        color: textColor,
      }}
      onClick={onClick}
    >
      <div>{value === 0 ? '' : `${value}`}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Network Fetch                               */
/* -------------------------------------------------------------------------- */

type SudokuProblem = {
  difficulty: string;
  gridProblem: number[][];
  solution: number[][];
};

type SudokuFetchResponse = {
  newboard: {
    grids: [{ value: number[][]; solution: number[][]; difficulty: string }];
    difficulty: string;
  };
};

async function fetchSudoku() {
  return fetch('https://sudoku-api.vercel.app/api/dosuku')
    .then((res) => res.json())
    .then((data) => {
      const response = data as SudokuFetchResponse;
      if (response.newboard.grids.length > 0) {
        return {
          difficulty: response.newboard.grids[0].difficulty,
          gridProblem: response.newboard.grids[0].value,
          solution: response.newboard.grids[0].solution,
        } as SudokuProblem;
      } else {
        throw new Error('No grid found');
      }
    });
}
