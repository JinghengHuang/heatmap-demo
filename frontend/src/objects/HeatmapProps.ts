import type ColorStep from "./ColorStep";

export default interface HeatmapProps {
  intensity: number
  alpha: number
  baseHeight: number
  colors: Array<ColorStep>
}