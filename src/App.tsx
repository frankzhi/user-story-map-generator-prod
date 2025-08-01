import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { StoryMapView } from './components/StoryMapView';
import type { StoryMap } from './types/story';

// Component to handle story map view with routing
const StoryMapViewWithRouting = ({ storyMap }: { storyMap: StoryMap }) => {
  const navigate = useNavigate();
  
  const handleBackToHome = () => {
    // Clear the story map from localStorage when going back to home
    localStorage.removeItem('currentStoryMap');
    navigate('/');
  };

  return (
    <StoryMapView
      storyMap={storyMap}
      onBack={handleBackToHome}
    />
  );
};

// Home page component with story map generation
const HomePageWithRouting = () => {
  const navigate = useNavigate();
  const [currentStoryMap, setCurrentStoryMap] = useState<StoryMap | null>(null);

  const handleStoryMapGenerated = (storyMap: StoryMap) => {
    setCurrentStoryMap(storyMap);
    localStorage.setItem('currentStoryMap', JSON.stringify(storyMap));
    navigate('/story-map');
  };

  return (
    <HomePage onStoryMapGenerated={handleStoryMapGenerated} />
  );
};

// Story map page component
const StoryMapPage = () => {
  const [currentStoryMap, setCurrentStoryMap] = useState<StoryMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load story map from localStorage on component mount
  useEffect(() => {
    const savedStoryMap = localStorage.getItem('currentStoryMap');
    if (savedStoryMap) {
      try {
        const parsedStoryMap = JSON.parse(savedStoryMap);
        setCurrentStoryMap(parsedStoryMap);
      } catch (e) {
        console.error('Failed to parse saved story map:', e);
        localStorage.removeItem('currentStoryMap');
        setError('Failed to load story map');
      }
    } else {
      // If no story map in localStorage, redirect to home
      navigate('/');
    }
  }, [navigate]);

  // Simple error boundary
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentStoryMap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Loading...</h1>
          <p className="text-gray-700">Loading story map...</p>
        </div>
      </div>
    );
  }

  return (
    <StoryMapViewWithRouting storyMap={currentStoryMap} />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePageWithRouting />} />
        <Route path="/story-map" element={<StoryMapPage />} />
      </Routes>
    </Router>
  );
}

export default App;
