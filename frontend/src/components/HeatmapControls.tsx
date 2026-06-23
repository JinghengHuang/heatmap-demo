import type ColorStep from "../objects/ColorStep";
import { useState } from 'react'
interface HeatmapControlsProps {
  intensity: number
  baseHeight: number
  colors: Array<ColorStep>
  alpha: number
  onIntensityChange: (value: number) => void
  onAlphaChange: (value: number) => void
  onBaseHeightChange: (value: number) => void
  onColorsChange: (value: Array<ColorStep>) => void
}
export default function HeatmapControls({
  intensity,
  colors,
  baseHeight,
  alpha,
  onColorsChange,
  onAlphaChange,
  onBaseHeightChange,
  onIntensityChange,
}: HeatmapControlsProps) {
  const [newStep, setNewStep] = useState(0.0)
  const [newColor, setNewColor] = useState("#000")
  const handleColorStepChange = function(index:number, updated: Partial<ColorStep>){
    onColorsChange(colors.map((step, i) => i === index ? {...step, ...updated} : step));
  }
  const handleColorStepAdd = function(newStep: ColorStep){
    onColorsChange([...colors, newStep]);
  }
  const handleColorStepRemove = function(index: number){
    onColorsChange([...colors.slice(0, index), ...colors.slice(index + 1)]);
  }
  return (
    <div style={{ padding: '1rem', background: '#1a1a2e', color: '#eee', minWidth: 220 }}>
      <h3 style={{ marginTop: 0 }}>Heatmap Controls</h3>
      <label style={{ marginTop: '1rem', display: 'block' }}>
        Intensity: {intensity.toFixed(1)}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={intensity}
          onChange={e => onIntensityChange(Number(e.target.value))}
          style={{ display: 'block', width: '100%' }}
        />
      </label>
      <label style={{ marginTop: '1rem', display: 'block' }}>
        Alpha: {alpha.toFixed(1)}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={alpha}
          onChange={e => onAlphaChange(Number(e.target.value))}
          style={{ display: 'block', width: '100%' }}
        />
      </label>
      <label style={{ marginTop: '1rem', display: 'block' }}>
        Colors: 
        <div>
          {
          colors.map((colorStep, index) => (
            <div
              key={index}>
              <label style={{ display: 'inline-block', marginLeft: '1rem' }}>
                Step:
                <input
                  key={index}
                  type="number"
                  min={0.1}
                  max={1}
                  value={colorStep.step}
                  onChange={e => handleColorStepChange(index, {step: Number(e.target.value)})}
                  style={{ display: 'inline-block', width: '100%' }}
                />
              </label>
              <label style={{ display: 'inline-block', marginLeft: '1rem' }}>
                Color:
                <input
                  key={index}
                  type="color"
                  value={colorStep.color}
                  onChange={e => handleColorStepChange(index, {color: String(e.target.value)})}
                  style={{ display: 'inline-block', width: '100%' }}
                />
              </label>
              <button style={{ display: 'inline-block', marginLeft: '1rem' }} onClick={e => {
                e.preventDefault();
                handleColorStepRemove(index);
              }}>Remove</button>
            </div>
          ))}
          
            <label style={{ display: 'inline-block', marginTop: '1rem' }}>
              New Color:
              <button style={{ display: 'inline-block', marginLeft: '1rem' }} onClick={e => {
                e.preventDefault();
                handleColorStepAdd({
                  step: newStep, color: newColor
                });
              }}>Add</button>
              <div>
                <label style={{ display: 'inline-block', marginLeft: '1rem' }}>
                  Step:
                  <input
                    type="number"
                    min={0.1}
                    max={1}
                    value={newStep}
                    onChange={e => setNewStep(Number(e.target.value))}
                    style={{ display: 'inline-block', width: '100%' }}
                  />
                </label>
                <label style={{ display: 'inline-block', marginLeft: '1rem' }}>
                  Color:
                  <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(String(e.target.value))}
                    style={{ display: 'inline-block', width: '100%' }}
                  />
                </label>
              </div>
            </label>
        </div>
      </label>
      <label style={{ marginTop: '1rem', display: 'block' }}>
        Base Height: {baseHeight.toFixed(1)}
        <input
          type="number"
          value={baseHeight}
          onChange={e => onBaseHeightChange(Number(e.target.value))}
          style={{ display: 'block', width: '100%' }}
        />
      </label>
    </div>
  )
}
