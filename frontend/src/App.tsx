import ErrorBoundary from './components/ErrorBoundary';
import ChatPage from './pages/ChatPage';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatPage />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
