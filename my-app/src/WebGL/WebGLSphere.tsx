import { useRef, useEffect } from 'react';
import * as webGL from './WebGLUtils';
import { Color } from './Color';
import { mat4 } from 'gl-matrix';

// prettier-ignore
function getMeshConstants() {
let vertices: number[] = [];
let colors: number[] = [];
let length = 1
let capHeight = 0.5

for (let i = 0; i < length; i++) {
    vertices.push(...[
      0, 0.8, 0,
      -0.4, 0.8 - capHeight, 0,
      0.2, 0.8 - capHeight, 0])
    colors.push(...Color.rainbow(0).toArray4())
    colors.push(...Color.rainbow(0.4).toArray4())
    colors.push(...Color.rainbow(.9).toArray4())
  }

  return {vertices, colors, ...getShaderSources()};
}

// prettier-ignore
function getMatrixConstants(canvas: HTMLCanvasElement) {
  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const zNear = .1;
  const zFar = 100.0;
	const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  
	const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [0, 0, -3], [0, 0, 0], [0, 1, 0])

  return { projectionMatrix, viewMatrix};
}

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

function draw(canvas: HTMLCanvasElement, worldMatrix: mat4) {
  const gl = webGL.getGLContext(canvas, [0.0, 0.8, 0.8, 1]);
  const { vertices, colors, vertexShader, fragmentShader } = getMeshConstants();
  const { projectionMatrix, viewMatrix } = getMatrixConstants(canvas);

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
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
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
      mat4.rotate(worldMatrix, identityMatrix, totalTime / 800, [0, 1, 0]);
      draw(canvas.current!, worldMatrix);
    }, 1000 / 60);

    return () => {
      clearInterval(intervalRef.current!);
    };
  }, []);

  return <canvas style={{ height: 600 }} ref={canvas} />;
}
