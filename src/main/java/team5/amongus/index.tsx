import { createBrowserHistory } from 'history';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.module.css';

const history = createBrowserHistory();
const rootNode = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootNode);

root.render(<App history={history} />);
