import Routes from './Routes';
import { LayerProvider } from './contexts/LayerContext';

function App() {
  return (
    <LayerProvider>
      <Routes />
    </LayerProvider>
  );
}

export default App;
