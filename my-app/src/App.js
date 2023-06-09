// import logo from "./logo.svg";
import './App.css';
import MainApp from './MainApp/MainApp';

function Header(props) {
  return (
    <div className='App'>
      <header className='App-header'>{props.children}</header>
    </div>
  );
}

function App() {
  return (
    <Header>
      <MainApp />
    </Header>
  );
}

export default App;
