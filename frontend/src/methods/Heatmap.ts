import { Viewer, Primitive, GeometryInstance, Cartesian3, MaterialAppearance, Material, Math as CMath, BoundingSphere, GeometryAttribute, ComponentDatatype, Geometry, PrimitiveType, GeometryAttributes} from 'cesium'
import { fetchDatasets, fetchDatasetByName } from "../api/index"
import { envelope } from '@turf/envelope'
import type HeatmapProps from '../objects/HeatmapProps'
import type { RefObject } from 'react'
import { coordAll } from '@turf/meta'
import vert from '../shaders/vert.vert?raw'
import frag from '../shaders/frag.frag?raw'
import type { FeatureCollection } from 'geojson'
import type ColorStep from '../objects/ColorStep'

interface samplePoint {
    lon: number
    lat: number
    height: number
}
interface uniformParams {
    colors: ColorStep[]
    alpha: number
}
class Heatmap{
    heatmapPrimitive: Primitive | undefined
    material: Material | null
    viewer: Viewer | null
    constructor() {
        this.heatmapPrimitive = undefined;
        this.material = null;
        this.viewer = null;
    }
    
    /**
     * Update the uniforms without re-render
     * @param heatmapParameters heatmap parameter data
     */
    updateMaterialUniforms(heatmapParameters: uniformParams){
        if(this.material){
            if(this.viewer){
                const ramp = this.createColorRampCanvas(heatmapParameters.colors)
                const alpha = heatmapParameters.alpha
                this.material.uniforms.u_ramp = ramp;
                this.material.uniforms.u_alpha = alpha;
            }
        }
    }
    /**
     * Create a canvas for color ramp used in heatmap rendering
     * @param stops color gradiant stops
     * @returns a canvas to use as textures
     */
    createColorRampCanvas(stops: Array<ColorStep>) {
        const width = 256;
        const height = 1;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if(ctx){

            const gradient = ctx.createLinearGradient(0, 0, width, 0);

            for (const stop of stops) {
                gradient.addColorStop(stop.step, stop.color);
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            return canvas;
        }
    }
    /**
     * Using K nearest point to determine current point height
     * @param lon current lon
     * @param lat current lat
     * @param samplePoints array of data points
     * @param k How many nearby points are calculated
     * @param power weight
     * @param intensity Exaggeration value
     * @returns 
     */
    interpolateHeightKNearest(lon: number, lat: number, samplePoints: Array<samplePoint>, k = 8, power = 2, intensity: number = 1) {
        const nearest = samplePoints
            .map((p) => {
                const dx = lon - p.lon;
                const dy = lat - p.lat;
                const d2 = dx * dx + dy * dy;
                return { point: p, d2 };
            })
            .sort((a, b) => a.d2 - b.d2)
            .slice(0, k);

        let numerator = 0.0;
        let denominator = 0.0;

        for (const item of nearest) {
            if (item.d2 < 1e-12) {
                return item.point.height;
            }

            const weight = 1.0 / Math.pow(item.d2, power / 2.0);

            numerator += weight * item.point.height * intensity;
            denominator += weight;
        }

        return numerator / denominator;
    }
    /**
     * Create grid polygon geometry with more vertices
     * @param south South boundary in lat
     * @param north North boundary in lat
     * @param east East boundary in lon
     * @param west West boundary in lon
     * @param height Default height of the points
     * @param size size of the grid in x and y direction, by default it's [50, 50] which means 50 vertices each row and 50 each column.
     * @param heights height array for getting min and max height
     * @returns 
     */
    customGridHeatmapGeometry(south: number, north: number, east: number, west: number, height: number, heatmapData: FeatureCollection, heatmapField: string, heights: number[], size?: Array<number> | undefined, bufferPercentage?: number | undefined, intensity: number = 50) {
        if (!size) {
            size = [50, 50]
        }
        if (size.length !== 2) {
            throw new Error("Invalid size format, need exactly 2 numbers.");
        }
        const rows = size[0];
        const cols = size[1];

        const positions = [];
        const indices = [];
        const normals = [];
        const sts = [];
        const features = heatmapData.features
        const samplePoints = [];
        for (const feature of features) {
            const lonlat = coordAll(feature).flat();
            if (heatmapField && feature.properties && feature.properties[heatmapField]) {
                samplePoints.push({
                    lon: lonlat[0],
                    lat: lonlat[1],
                    height: height + feature.properties[heatmapField] || height,
                })
            } else {
                samplePoints.push({
                    lon: lonlat[0],
                    lat: lonlat[1],
                    height: height,
                })
            }
        }
        if(bufferPercentage){
            south -= Math.abs((north - south) * bufferPercentage * 0.01)
            north += Math.abs((north - south) * bufferPercentage * 0.01)
            east -= Math.abs((east - west) * bufferPercentage * 0.01)
            west += Math.abs((east - west) * bufferPercentage * 0.01)
        }
        for (let r = 0; r <= rows; r++) {
            const v = r / rows;
            const lat = CMath.lerp(south, north, v);

            for (let c = 0; c <= cols; c++) {
                const u = c / cols;
                sts.push(u, v)
                const lon = CMath.lerp(west, east, u);
                const vertexHeight = height + this.interpolateHeightKNearest(lon, lat, samplePoints, 8, 2, intensity)
                const cart = Cartesian3.fromDegrees(lon, lat, vertexHeight);
                heights.push(vertexHeight)
                positions.push(cart.x, cart.y, cart.z);

                // Approximate outward normal from ellipsoid center
                const normal = Cartesian3.normalize(cart, new Cartesian3());
                normals.push(normal.x, normal.y, normal.z);
            }
        }
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i0 = r * (cols + 1) + c;
                const i1 = i0 + 1;
                const i2 = i0 + (cols + 1);
                const i3 = i2 + 1;

                indices.push(i0, i2, i1);
                indices.push(i1, i2, i3);
            }
        }
        const cartesianPositions = [];
        for (let i = 0; i < positions.length; i += 3) {
            cartesianPositions.push(
                new Cartesian3(
                    positions[i],
                    positions[i + 1],
                    positions[i + 2]
                )
            );
        }
        const attrs = {
            position: new GeometryAttribute({
                componentDatatype: ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: new Float64Array(positions),
            }),
            normal: new GeometryAttribute({
                componentDatatype: ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: new Float32Array(normals)
            }),
            st: new GeometryAttribute({
                componentDatatype: ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: new Float64Array(sts),
            }),
            tangent: undefined,
            color: undefined,
            bitangent: undefined
        } as GeometryAttributes;
        (attrs as unknown as Record<string, GeometryAttribute>)["height"] = new GeometryAttribute({
            componentDatatype: ComponentDatatype.FLOAT,
            componentsPerAttribute: 1,
            values: new Float32Array(heights)
        })
        const geometry = new Geometry({
            attributes: attrs,

            indices:
                positions.length / 3 > 65535
                    ? new Uint32Array(indices)
                    : new Uint16Array(indices),

            primitiveType: PrimitiveType.TRIANGLES,

            boundingSphere: BoundingSphere.fromPoints(cartesianPositions),
            
        });

        return geometry
    }

    heatmapRender(viewerRef: RefObject<Viewer | null>, heatmapParameters: HeatmapProps, flyTo: RefObject<boolean>) {
        const viewer = viewerRef.current;
        this.viewer = viewer;
        fetchDatasets().then(datasets => {
            datasets.forEach(async dataset => {
                fetchDatasetByName(dataset).then(async (data) => {

                    if (viewer !== null && viewer.cesiumWidget !== undefined) {
                        const envelopePolygon = envelope(data);
                        const bbox = envelopePolygon.bbox;
                        if (bbox) {
                            const coords = coordAll(envelopePolygon).flat();
                            const car3Array = Cartesian3.fromDegreesArray(coords);
                            // Bounding sphere for camera control
                            const bs = BoundingSphere.fromPoints(car3Array);
                            
                            const heights:number[] = [];
                            const size = [512, 512];
                            const geom = this.customGridHeatmapGeometry(bbox[1], bbox[3], bbox[0], bbox[2], heatmapParameters.baseHeight, data, "value", heights, size, 50, heatmapParameters.intensity)
                            const ramp = this.createColorRampCanvas(heatmapParameters.colors)
                            const instance = new GeometryInstance({
                                geometry: geom
                            });
                            const fabric = {
                                type: "heatmap",
                                uniforms: {
                                    u_ramp: ramp,
                                    u_minHeight: Math.min(...heights),
                                    u_maxHeight: Math.max(...heights),
                                    u_alpha: heatmapParameters.alpha
                                },
                                source: frag
                            }
                            if(!this.material){
                                this.material = new Material({
                                    fabric: fabric,
                                    translucent: false
                                })
                            }else{
                                this.material.uniforms.u_ramp = ramp;
                                this.material.uniforms.u_minHeight = Math.min(...heights);
                                this.material.uniforms.u_maxHeight = Math.max(...heights);
                                this.material.uniforms.u_alpha = heatmapParameters.alpha;
                            }
                            const appearance = new MaterialAppearance({
                                material: this.material,
                                vertexShaderSource: vert,
                                translucent: true,
                                closed: false,
                                renderState: {
                                    depthTest: {
                                        enabled: true
                                    },
                                    depthMask: true,
                                    cull: {
                                        enabled: false
                                    }
                                }
                            });
                            if(this.heatmapPrimitive){
                                viewer.scene.primitives.remove(this.heatmapPrimitive)
                                this.heatmapPrimitive = undefined;
                            }
                            this.heatmapPrimitive = new Primitive({
                                geometryInstances: instance,
                                appearance: appearance,
                                asynchronous: false
                            })
                            viewer.scene.primitives.add(this.heatmapPrimitive)
                            if(flyTo.current){
                                console.log("fly")
                                viewer.camera.flyToBoundingSphere(bs);
                                flyTo.current = false
                            }
                        }
                    }
                }).catch(ex => {
                    console.error(ex)
                })
            })
        }).catch(ex => {
            console.error(ex)
        })
    }
}

export default Heatmap