import { Suspense, useMemo, useState } from 'react';
import { AppContext } from './App.context';
import { StyledApp } from './App.styles';
import { FaceWsDemo } from './pages/FaceWsDemo';

function App() {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(true);

  const contextValue = useMemo(
    () => ({
      isAnimationEnabled,
      setIsAnimationEnabled,
      isEditing,
      setIsEditing,
    }),
    [isAnimationEnabled, isEditing],
  );

  return (
    <StyledApp>
      <AppContext.Provider value={contextValue}>
        <Suspense fallback={null}>
          {/*<Webcam width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ left: 0 }} />*/}
          <FaceWsDemo />
        </Suspense>
      </AppContext.Provider>
    </StyledApp>
  );
}

export default App;
