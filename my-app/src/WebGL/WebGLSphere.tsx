import { useRef, useEffect } from 'react';
import * as webGL from './WebGLUtils';

// prettier-ignore
function getMeshConstants() {
  const vertices = [
  -0.8,  0.4,
   0.8,  0.4,
   0.8, -0.4,
  -0.8,  0.4,
   0.8, -0.4,
  -0.8, -0.4];

  const colors = [
  1, 0, 0, 1,
  0, 1, 0, 1,
  0, 0, 1, 1,
  1, 0, 0, 1,
  0, 0, 1, 1,
  1, 0, 1, 1];

  const matrix = [
  1, 0, 0, 0,
  0, 1, 0, 0, 
  0, 0, 1, 0,
  0, 0, 0, 1];

  return {vertices, colors, matrix, ...getShaderSources()};
}

function getShaderSources() {
  const vertexShader = `# version 300 es
  in vec2 pos;
  in vec4 clr;

  uniform mat4 trans;

  out vec4 vcolor;

  void main()
  {
      gl_Position = trans * vec4(pos,0,1); // vec4(x,y,z,w)
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

function draw(canvas: HTMLCanvasElement) {
  const { vertices, colors, vertexShader, fragmentShader, matrix } = getMeshConstants();

  /* ----------------------------- Create Program ----------------------------- */
  const gl = webGL.getGLContext(canvas, [0.0, 0.8, 0.8, 1]);
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
  const m = gl.getUniformLocation(program, 'trans');
  gl.useProgram(program);
  gl.uniformMatrix4fv(m, false, matrix);

  /* ---------------------- Set Vertex Shader Attributes ---------------------- */
  const p = gl.getAttribLocation(program, 'pos');
  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
  gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0); // Pull out 2 FLOATs per iteration
  gl.enableVertexAttribArray(p);

  const c = gl.getAttribLocation(program, 'clr');
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.vertexAttribPointer(c, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(c);

  /* ------------------------------ Draw Scene ------------------------------- */
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export default function App() {
  const canvas = useRef(null as HTMLCanvasElement | null);

  useEffect(() => {
    draw(canvas.current!);
  });

  return <canvas style={{ height: 600 }} ref={canvas} />;
}
