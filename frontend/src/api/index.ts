import type { FeatureCollection } from "geojson"

const BASE_URL = '/api'

export async function fetchDatasets(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/datasets`)
  if (!res.ok) throw new Error(`Failed to fetch datasets: ${res.status}`)
  return res.json()
}

export async function fetchDatasetByName(name:string): Promise<FeatureCollection> {
  const res = await fetch(`${BASE_URL}/datasets/${name}`)
  if (!res.ok) throw new Error(`Failed to fetch datasets: ${res.status}`)
  return res.json()
}