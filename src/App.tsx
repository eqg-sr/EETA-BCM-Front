import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CausasProvider } from './context/CausasContext';
import Routes from './routes';

export default function App() {
  return (
    <AuthProvider>
      <CausasProvider>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </CausasProvider>
    </AuthProvider>
  );
}
