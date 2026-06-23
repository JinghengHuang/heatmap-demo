in vec3 position3DHigh;
in vec3 position3DLow;
in float batchId;
in vec3 normal;
in float height;
in vec2 st;

out float v_batchId;
out float v_heightValue;
out vec3 v_positionEC;
out vec3 v_normalEC;
out vec2 v_st;


void main()
{
    v_batchId = batchId;
    v_heightValue = height;
    vec4 position = czm_computePosition();

    vec4 positionEC = czm_modelViewRelativeToEye * position;
    v_normalEC = normalize(czm_normal * normal);
    v_positionEC = positionEC.xyz;

    v_st = st;

    position.xyz += normal;

    gl_Position = czm_modelViewProjectionRelativeToEye * position;
}