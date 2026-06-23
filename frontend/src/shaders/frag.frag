in float v_heightValue;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);

    float t = (v_heightValue - u_minHeight) / (u_maxHeight - u_minHeight);
    t = clamp(t, 0.0, 1.0);

    vec4 rampColor = texture(u_ramp, vec2(t, 0.5));

    material.diffuse = rampColor.rgb;
    material.alpha = u_alpha;

    return material;
}