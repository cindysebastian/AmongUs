import { createBrowserHistory } from 'history';
import App from './App';
import './styles/index.module.css';
import ReactDOM from 'react-dom/client';


const history = createBrowserHistory();
const rootNode = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootNode);

root.render(<App history={history} />);
