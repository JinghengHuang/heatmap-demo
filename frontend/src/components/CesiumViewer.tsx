import { useEffect, useRef } from 'react'
import { ImageryLayer, OpenStreetMapImageryProvider, Viewer } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import type HeatmapProps from '../objects/HeatmapProps'
import Heatmap from '../methods/Heatmap'

export default function CesiumViewer({
  intensity,
  colors,
  baseHeight,
  alpha
}: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const heatmapRef = useRef<Heatmap | null>(null)
  
  const paramsRef = useRef<HeatmapProps>({
      intensity,
      colors,
      baseHeight,
      alpha
  })
  const firstTime = useRef(true)
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return
    const viewer = new Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      baseLayer: new ImageryLayer(
        new OpenStreetMapImageryProvider({
          url: "https://tile.openstreetmap.org/"
        })
      ),
      terrain: undefined
    })
    viewerRef.current = viewer;
    const heatmap = new Heatmap();
    heatmapRef.current = heatmap;
    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [])
  useEffect(()=>{
    const heatmap = heatmapRef.current;
    if(paramsRef.current){
      paramsRef.current.intensity = intensity;
      paramsRef.current.baseHeight = baseHeight;
    }
    heatmap?.heatmapRender(viewerRef, paramsRef.current, firstTime)
  }, [intensity,
  baseHeight])
  useEffect(()=>{
    const heatmap = heatmapRef.current;
    if(paramsRef.current){
      paramsRef.current.colors = colors;
      paramsRef.current.alpha = alpha;
    }
    heatmap?.updateMaterialUniforms({
      colors: colors,
      alpha: alpha
    })
  }, [
  colors,
  alpha])
  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
}
