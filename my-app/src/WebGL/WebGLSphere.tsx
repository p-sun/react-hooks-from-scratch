import { useRef, useEffect } from 'react';
import * as webGL from './WebGLUtils';
import { Color } from './Color';
import { mat4 } from 'gl-matrix';

/* -------------------------------------------------------------------------- */
/*                                    Draw                                    */
/* -------------------------------------------------------------------------- */
function draw(canvas: HTMLCanvasElement, worldMatrix: mat4) {
  /* -------------------------------- Config GL -------------------------------- */
  const gl = webGL.getGLContext(canvas, [0.0, 0.8, 0.8, 1]);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK); // default
  gl.frontFace(gl.CW); // default

  /* ------------------------------- Setup Mesh ------------------------------- */
  const STEPS_V = 24; // Number of vertical layers
  const STEPS_H = 18; // Number of angles in each horizontal circle, in a layer
  const SPHERE_RADIUS = 0.8;
  const LOOKAT_DIR: [number, number, number] = [0, 1.6, -2.4];

  const sphereDrawables = getSphereMesh(gl, SPHERE_RADIUS, STEPS_H, STEPS_V);
  const vertices = sphereDrawables.map((d) => d.vertices).flat();
  const colors = sphereDrawables.map((d) => d.colors).flat();
  const { projectionMatrix, viewMatrix } = getMatrixConstants(canvas, LOOKAT_DIR);
  const { vertexShader, fragmentShader } = getShaderSources();

  /* ----------------------------- Create Program ----------------------------- */
  const vs = webGL.compileShader(gl, vertexShader, gl.VERTEX_SHADER);
  const fs = webGL.compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
  const program = webGL.linkProgram(gl, vs, fs);
  gl.useProgram(program);

  /* ------------------------------ Create Buffers ---------------------------- */
  const pos_buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer); // Use data from vertices buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer); // Use data from colors buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  /* -------------------------- Set Uniform Variables ------------------------- */
  const mProjLocation = gl.getUniformLocation(program, 'mProj');
  gl.uniformMatrix4fv(mProjLocation, false, projectionMatrix);

  const mViewLocation = gl.getUniformLocation(program, 'mView');
  gl.uniformMatrix4fv(mViewLocation, false, viewMatrix);

  const mWorldLocation = gl.getUniformLocation(program, 'mWorld');
  gl.uniformMatrix4fv(mWorldLocation, false, worldMatrix);

  /* ---------------------- Set Vertex Shader Attributes ---------------------- */
  const p = gl.getAttribLocation(program, 'pos');
  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
  gl.vertexAttribPointer(p, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(p);

  const c = gl.getAttribLocation(program, 'clr');
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.vertexAttribPointer(c, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(c);

  /* ------------------------------ Draw Scene ------------------------------- */
  var startIdx = 0;
  for (const drawable of sphereDrawables) {
    const vertexCount = drawable.vertices.length / 3;
    gl.drawArrays(drawable.drawArraysType, startIdx, vertexCount);
    startIdx += vertexCount;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Shaders                                  */
/* -------------------------------------------------------------------------- */
function getShaderSources() {
  const vertexShader = `# version 300 es
  in vec3 pos;
  in vec4 clr;

  uniform mat4 mProj;
  uniform mat4 mView;
  uniform mat4 mWorld;

  out vec4 vcolor;

  void main()
  {
      gl_Position = mProj * mView * mWorld * vec4(pos,1); // vec4(x,y,z,w)
      vcolor = clr;
  }
  `;

  const fragmentShader = `# version 300 es
  precision mediump float;
  in vec4 vcolor;
  out vec4 color;

  void main()
  {
    color = vcolor;
  }
  `;

  return { vertexShader, fragmentShader };
}

/* -------------------------------------------------------------------------- */
/*                                   Matrix                                   */
/* -------------------------------------------------------------------------- */
function getMatrixConstants(canvas: HTMLCanvasElement, lookAtDir: [number, number, number]) {
  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, lookAtDir, [0, 0, 0], [0, 1, 0]);

  return { projectionMatrix, viewMatrix };
}

/* -------------------------------------------------------------------------- */
/*                                Sphere Mesh                                 */
/* -------------------------------------------------------------------------- */
type Drawable = {
  vertices: number[];
  colors: number[];
  drawArraysType: GLenum;
};

function getSphereMesh(
  gl: WebGL2RenderingContext,
  sphereRadius: number,
  stepsH: number,
  stepsV: number
) {
  const firstAngleRad = Math.PI / 2 - (1 / stepsV) * Math.PI;
  const circleVertices = verticesForCircle(sphereRadius, firstAngleRad, stepsH);

  /* ------------------------ First layer of triangles ------------------------ */
  let firstLayer: Drawable = { vertices: [], colors: [], drawArraysType: gl.TRIANGLE_FAN };
  firstLayer.vertices.push(...[0, sphereRadius, 0]);
  firstLayer.colors.push(...[1, 1, 1, 1]); // white
  for (let i = 0; i < stepsH + 1; i++) {
    firstLayer.vertices.push(...circleVertices[i % stepsH]);
    firstLayer.colors.push(...Color.rainbow((i % stepsH) / stepsH).array4());
  }

  /* ------------------------ Last layer of triangles ------------------------ */
  let lastLayer: Drawable = { vertices: [], colors: [], drawArraysType: gl.TRIANGLE_FAN };
  lastLayer.vertices.push(...[0, -sphereRadius, 0]);
  lastLayer.colors.push(...[1, 1, 1, 1]); // white
  for (let i = stepsH + 1; i > 0; i--) {
    const v = circleVertices[i % stepsH];
    lastLayer.vertices.push(v[0], -v[1], v[2]);
    lastLayer.colors.push(...Color.rainbow((i % stepsH) / stepsH).array4());
  }

  /* ------------------------ Middle layer of triangles ----------------------- */
  let middleLayers: Drawable = { vertices: [], colors: [], drawArraysType: gl.TRIANGLE_STRIP };
  // For each vertical layer
  for (let i = 1; i < stepsV - 1; i++) {
    const angleYRad = Math.PI / 2 - (i / stepsV) * Math.PI;
    const currentCircle = verticesForCircle(sphereRadius, angleYRad, stepsH);

    const nextAngleYRad = Math.PI / 2 - ((i + 1) / stepsV) * Math.PI;
    const nextCircle = verticesForCircle(sphereRadius, nextAngleYRad, stepsH);

    // For each horizontal angle
    for (let j = 0; j < stepsH + 1; j++) {
      const color = Color.rainbow((j % stepsH) / stepsH).array4();
      middleLayers.vertices.push(...currentCircle[j % stepsH]);
      middleLayers.colors.push(...color);

      middleLayers.vertices.push(...nextCircle[j % stepsH]);
      middleLayers.colors.push(...color);
    }
  }

  return [firstLayer, lastLayer, middleLayers];
}

// Horizontal circle
function verticesForCircle(sphereRadius: number, angleRadXY: number, stepsH: number) {
  let vertices: number[][] = [];
  for (let i = 0; i < stepsH; i++) {
    vertices.push(vertexOnSphere(sphereRadius, angleRadXY, (i / stepsH) * Math.PI * 2));
  }
  return vertices;
}

function vertexOnSphere(sphereRadius: number, angleRadXY: number, angleRadXZ: number) {
  let xRadius = sphereRadius * Math.cos(angleRadXY);
  let y = sphereRadius * Math.sin(angleRadXY);

  let x = xRadius * Math.cos(angleRadXZ);
  let z = xRadius * Math.sin(angleRadXZ);

  return [x, y, z];
}

/* -------------------------------------------------------------------------- */
/*                               React Component                              */
/* -------------------------------------------------------------------------- */
export default function App() {
  const canvas = useRef(null as HTMLCanvasElement | null);
  const intervalRef = useRef(undefined as undefined | NodeJS.Timer);
  const startTime = useRef(performance.now());
  const worldMatrix = mat4.create();
  const identityMatrix = mat4.create();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const totalTime = performance.now() - startTime.current;
      mat4.rotate(worldMatrix, identityMatrix, totalTime / 800 / 3, [0, 1, 0]);
      draw(canvas.current!, worldMatrix);
    }, 1000 / 60);

    return () => {
      clearInterval(intervalRef.current!);
    };
  });

  return <canvas style={{ height: 600 }} ref={canvas} />;
}
