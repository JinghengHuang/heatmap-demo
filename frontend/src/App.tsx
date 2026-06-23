import { useState } from 'react'
import CesiumViewer from './components/CesiumViewer'
import HeatmapControls from './components/HeatmapControls'
import type colorStep from "./objects/ColorStep";

function App() {
  const [intensity, setIntensity] = useState(50.0)
  const [baseHeight, setBaseHeight] = useState(1.0)
  const [alpha, setAlpha] = useState(0.8)
  const [colors, setColors] = useState<colorStep[]>([{ step: 0.0, color: '#00ffff' }, { step: 0.5, color: '#00ff00' }, { step: 1.0, color: '#ff0000' }])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <HeatmapControls
        intensity={intensity}
        colors={colors}
        baseHeight={baseHeight}
        alpha={alpha}
        onColorsChange={setColors}
        onAlphaChange={setAlpha}
        onBaseHeightChange={setBaseHeight}
        onIntensityChange={setIntensity}
      />
      <div style={{ flex: 1 }}>
        <CesiumViewer 
          intensity={intensity}
          baseHeight={baseHeight}
          colors={colors}
          alpha={alpha}
        />
      </div>
    </div>
  )
}

export default App
