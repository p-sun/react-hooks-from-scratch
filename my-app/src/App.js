// import logo from "./logo.svg";
import "./App.css";
import HooksApp from "./Hooks/HooksApp.tsx";

function Header(props) {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a> */}
        {props.children}
      </header>
    </div>
  );
}

function App() {
  return (
    <Header>
      <HooksApp />
    </Header>
  );
}

export default App;