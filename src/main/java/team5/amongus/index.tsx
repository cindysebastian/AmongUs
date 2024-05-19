import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import App from './App';
import './styles/index.module.css';
import { InputBlockProvider } from './service (Frontend)/InputBlockContext'; // Correctly import the context provider

const history = createBrowserHistory();
const rootNode = document.getElementById('root');

ReactDOM.render(
  <InputBlockProvider> {/* Wrap your App with InputBlockProvider */}
    <App history={history} />
  </InputBlockProvider>,
  rootNode
);
