import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import App from './App';
import { Providers } from './context';
class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div style={{ padding: '12vh 8vw', fontFamily: 'DM Sans, sans-serif' }}><h1>Something interrupted this page.</h1><p>Please reload to try again.</p><button onClick={() => window.location.reload()}>Reload page</button></div> : this.props.children; }
}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><ErrorBoundary><BrowserRouter><Providers><App /></Providers></BrowserRouter></ErrorBoundary></React.StrictMode>);
