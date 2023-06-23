import { useRef, useEffect } from 'react';
import * as webGL from './WebGLUtils';
import { Color } from './Color';
import { mat4 } from 'gl-matrix';

/* -------------------------------------------------------------------------- */
/*                                    Draw                                    */
/* -------------------------------------------------------------------------- */
function draw(canvas: HTMLCanvasElement, worldMatrix: mat4) {
  const SUBDIVISION = 10;
  const SPHERE_RADIUS = 0.8;
  const LOOKAT_DIR: [number, number, number] = [0, 2, -2.4];

  const gl = webGL.getGLContext(canvas, [0.0, 0.8, 0.8, 1]);
  const sphereDrawables = getSphereMesh(gl, SPHERE_RADIUS, SUBDIVISION);
  const vertices = sphereDrawables.map((d) => d.vertices).flat();
  const colors = sphereDrawables.map((d) => d.colors).flat();
  const { projectionMatrix, viewMatrix } = getMatrixConstants(canvas, LOOKAT_DIR);
  const { vertexShader, fragmentShader } = getShaderSources();

  /* ----------------------------- Create Program ----------------------------- */
  const vs = webGL.compileShader(gl, vertexShader, gl.VERTEX_SHADER);
  const fs = webGL.compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
  const program = webGL.linkProgram(gl, vs, fs);

  /* ------------------------------ Create Buffers ---------------------------- */
  const pos_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer); // Use data from vertices buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer); // Use data from colors buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  /* -------------------------- Set Uniform Variables ------------------------- */
  gl.useProgram(program);

  const mProjLocation = gl.getUniformLocation(program, 'mProj');
  gl.uniformMatrix4fv(mProjLocation, false, projectionMatrix);

  const mViewLocation = gl.getUniformLocation(program, 'mView');
  gl.uniformMatrix4fv(mViewLocation, false, viewMatrix);

  const mWorldLocation = gl.getUniformLocation(program, 'mWorld');
  gl.uniformMatrix4fv(mWorldLocation, false, worldMatrix);

  /* ---------------------- Set Vertex Shader Attributes ---------------------- */
  const p = gl.getAttribLocation(program, 'pos');
  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
  gl.vertexAttribPointer(p, 3, gl.FLOAT, false, 0, 0); // Pull out 3 FLOATs per iteration
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

function getSphereMesh(gl: WebGL2RenderingContext, sphereRadius: number, length: number) {
  /* ------------------------ First layer of triangles ------------------------ */
  const firstAngleRad = Math.PI / 2 - (1 / length) * Math.PI;
  const circleVertices = verticesForCircle(sphereRadius, firstAngleRad, length);

  let firstLayer: Drawable = { vertices: [], colors: [], drawArraysType: gl.TRIANGLE_FAN };
  firstLayer.vertices.push(...[0, sphereRadius, 0]);
  firstLayer.colors.push(...Color.rainbow(0).toArray4()); // red
  for (let i = 0; i < length + 1; i++) {
    firstLayer.vertices.push(...circleVertices[i % length]);
    firstLayer.colors.push(...Color.rainbow((i % length) / length).toArray4());
  }

  /* ------------------------ Last layer of triangles ------------------------ */
  let lastLayer: Drawable = { vertices: [], colors: [], drawArraysType: gl.TRIANGLE_FAN };
  lastLayer.vertices.push(...[0, -sphereRadius, 0]);
  lastLayer.colors.push(...Color.rainbow(0).toArray4()); // red
  for (let i = 0; i < length + 1; i++) {
    const v = circleVertices[i % length];
    lastLayer.vertices.push(v[0], -v[1], v[2]);
    lastLayer.colors.push(...Color.rainbow((i % length) / length).toArray4());
  }

  /* ------------------------ Middle layer of triangles ----------------------- */
  let middleLayers: Drawable = { vertices: [], colors: [], drawArraysType: gl.TRIANGLE_STRIP };
  // For each vertical layer
  for (let i = 1; i < length - 1; i++) {
    const angleYRad = Math.PI / 2 - (i / length) * Math.PI;
    const currentCircle = verticesForCircle(sphereRadius, angleYRad, length);

    const nextAngleYRad = Math.PI / 2 - ((i + 1) / length) * Math.PI;
    const nextCircle = verticesForCircle(sphereRadius, nextAngleYRad, length);

    // For each horizontal angle
    for (let j = 0; j < length + 1; j++) {
      middleLayers.vertices.push(...currentCircle[j % length]);
      middleLayers.colors.push(...Color.rainbow((j % length) / length).toArray4());
      middleLayers.vertices.push(...nextCircle[j % length]);
      middleLayers.colors.push(...Color.rainbow((j % length) / length).toArray4());
    }
  }

  return [firstLayer, lastLayer, middleLayers];
}

function verticesForCircle(sphereRadius: number, angleRadXY: number, length: number) {
  let vertices: number[][] = [];
  for (let i = 0; i < length; i++) {
    vertices.push(vertexForSphere(sphereRadius, angleRadXY, (i / length) * Math.PI * 2));
  }
  return vertices;
}

function vertexForSphere(sphereRadius: number, angleRadXY: number, angleRadXZ: number) {
  let xRadius = sphereRadius * Math.cos(angleRadXY);
  let y = sphereRadius * Math.sin(angleRadXY);

  let x = xRadius * Math.cos(angleRadXZ);
  let z = xRadius * Math.sin(angleRadXZ);

  return [x, y, z];
}

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
