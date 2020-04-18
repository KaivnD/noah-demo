import {
  Box3,
  Vector3,
  BufferAttribute,
  Object3D,
  BufferGeometry,
} from "three";

const box = new Box3();

export default {
  suportWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  },
  getSize(object: Object3D) {
    box.setFromObject(object);
    return box.getSize(new Vector3());
  },
  getCenter(object: Object3D) {
    box.setFromObject(object);
    return box.getCenter(new Vector3());
  },
  // from https://github.com/mattdesl/webgl-wireframes
  vertexShader: `
  attribute vec3 barycentric;
  attribute float even;
  varying vec3 vBarycentric;
  void main () {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    vBarycentric = barycentric;
  }`,
  fragmentShader: `
  varying vec3 vBarycentric;
  uniform float time;
  uniform float thickness;
  uniform float secondThickness;
  uniform float dashRepeats;
  uniform float dashLength;
  uniform bool dashOverlap;
  uniform bool dashEnabled;
  uniform bool dashAnimate;
  uniform bool seeThrough;
  uniform bool insideAltColor;
  uniform bool dualStroke;
  uniform bool squeeze;
  uniform float squeezeMin;
  uniform float squeezeMax;
  uniform vec3 stroke;
  uniform vec3 fill;
  // This is like
  float aastep (float threshold, float dist) {
    float afwidth = fwidth(dist) * 0.5;
    return smoothstep(threshold - afwidth, threshold + afwidth, dist);
  }
  // This function is not currently used, but it can be useful
  // to achieve a fixed width wireframe regardless of z-depth
  float computeScreenSpaceWireframe (vec3 barycentric, float lineWidth) {
    vec3 dist = fwidth(barycentric);
    vec3 smoothed = smoothstep(dist * ((lineWidth * 0.5) - 0.5), dist * ((lineWidth * 0.5) + 0.5), barycentric);
    return 1.0 - min(min(smoothed.x, smoothed.y), smoothed.z);
  }
  // This function returns the fragment color for our styled wireframe effect
  // based on the barycentric coordinates for this fragment
  vec4 getStyledWireframe (vec3 barycentric) {
    // this will be our signed distance for the wireframe edge
    float d = min(min(barycentric.x, barycentric.y), barycentric.z);
    // for dashed rendering, we can use this to get the 0 .. 1 value of the line length
    float positionAlong = max(barycentric.x, barycentric.y);
    if (barycentric.y < barycentric.x && barycentric.y < barycentric.z) {
      positionAlong = 1.0 - positionAlong;
    }
    // the thickness of the stroke
    float computedThickness = thickness;
    // if we want to shrink the thickness toward the center of the line segment
    if (squeeze) {
      computedThickness *= mix(squeezeMin, squeezeMax, (1.0 - sin(positionAlong * 3.1415926535)));
    }
    // if we should create a dash pattern
    if (dashEnabled) {
      // here we offset the stroke position depending on whether it
      // should overlap or not
      float offset = 1.0 / dashRepeats * dashLength / 2.0;
      if (!dashOverlap) {
        offset += 1.0 / dashRepeats / 2.0;
      }
      // if we should animate the dash or not
      if (dashAnimate) {
        offset += time * 0.22;
      }
      // create the repeating dash pattern
      float pattern = fract((positionAlong + offset) * dashRepeats);
      computedThickness *= 1.0 - aastep(dashLength, pattern);
    }
    // compute the anti-aliased stroke edge
    float edge = 1.0 - aastep(computedThickness, d);
    // now compute the final color of the mesh
    vec4 outColor = vec4(0.0);
    if (seeThrough) {
      outColor = vec4(stroke, edge);
      if (insideAltColor && !gl_FrontFacing) {
        outColor.rgb = fill;
      }
    } else {
      vec3 mainStroke = mix(fill, stroke, edge);
      outColor.a = 1.0;
      if (dualStroke) {
        float inner = 1.0 - aastep(secondThickness, d);
        vec3 wireColor = mix(fill, stroke, abs(inner - edge));
        outColor.rgb = wireColor;
      } else {
        outColor.rgb = mainStroke;
      }
    }
    return outColor;
  }
  void main () {
    gl_FragColor = getStyledWireframe(vBarycentric);
  }`,
  addBarycentricCoordinates(
    bufferGeometry: BufferGeometry,
    removeEdge: boolean
  ) {
    const attrib =
      bufferGeometry.getIndex() || bufferGeometry.getAttribute("position");
    const count = attrib.count / 3;
    const barycentric = [];

    // for each triangle in the geometry, add the barycentric coordinates
    for (let i = 0; i < count; i++) {
      const even = i % 2 === 0;
      const Q = removeEdge ? 1 : 0;
      if (even) {
        barycentric.push(0, 0, 1, 0, 1, 0, 1, 0, Q);
      } else {
        barycentric.push(0, 1, 0, 0, 0, 1, 1, 0, Q);
      }
    }

    // add the attribute to the geometry
    const array = new Float32Array(barycentric);
    const attribute = new BufferAttribute(array, 3);
    bufferGeometry.setAttribute("barycentric", attribute);
  },
  unindexBufferGeometry(bufferGeometry: BufferGeometry) {
    // un-indices the geometry, copying all attributes like position and uv
    const index = bufferGeometry.getIndex();
    if (!index) return; // already un-indexed

    const indexArray = index.array;
    const triangleCount = indexArray.length / 3;

    const attributes = bufferGeometry.attributes;
    const newAttribData = Object.keys(attributes).map((key) => {
      let arr: number[] = [];
      return {
        array: arr,
        attribute: bufferGeometry.getAttribute(key),
      };
    });

    for (let i = 0; i < triangleCount; i++) {
      // indices into attributes
      const a = indexArray[i * 3 + 0];
      const b = indexArray[i * 3 + 1];
      const c = indexArray[i * 3 + 2];
      const indices = [a, b, c];

      // for each attribute, put vertex into unindexed list
      newAttribData.forEach((data) => {
        const attrib = data.attribute;
        const dim = attrib.itemSize;
        // add [a, b, c] vertices
        for (let i = 0; i < indices.length; i++) {
          const index = indices[i];
          for (let d = 0; d < dim; d++) {
            const v = attrib.array[index * dim + d];
            data.array.push(v);
          }
        }
      });
    }
    index.array = [];
    bufferGeometry.setIndex(null);

    // now copy over new data
    newAttribData.forEach((data) => {
      data.attribute = new BufferAttribute(data.array, data.array.length);
    });
  },
};
