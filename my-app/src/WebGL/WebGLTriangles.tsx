import { useRef, useEffect } from 'react';
import * as webGL from './WebGLUtils';

// Refactored from https://www.youtube.com/watch?v=je_PhVKJYng
// prettier-ignore
function drawDoubleTriangles(canvas: HTMLCanvasElement) {
  const vertices = [
  -0.8,  0.4, 0,
   0.8,  0.4, 0,
   0.8, -0.4, 0,
  -0.8,  0.4, 0,
   0.8, -0.4, 0,
  -0.8, -0.4, 0
  ];

  const colors = [
  1, 0, 0, 1,
  0, 1, 0, 1,
  0, 0, 1, 1,
  1, 0, 0, 1,
  0, 0, 1, 1,
  1, 0, 1, 1
  ];

  const vertexShader = `
  attribute vec3 pos;
  attribute vec4 clr;

  uniform mat4 trans;

  varying vec4 vcolor;

  void main()
  {
      gl_Position = trans * vec4(pos,1);
      vcolor = clr;
  }
  `;

  const fragmentShader = `
  precision mediump float;
  varying vec4 vcolor;
  
  void main()
  {
      gl_FragColor = vcolor;
  }
  `;

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
	const matrix = [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1 ];
  gl.useProgram(program);
  gl.uniformMatrix4fv(m, false, matrix);

  /* ---------------------- Set Vertex Buffer Attributes ---------------------- */
  const p = gl.getAttribLocation(program, 'pos');
  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
  gl.vertexAttribPointer(p, 3, gl.FLOAT, false, 0, 0); // Pull out 3 FLOATs per iteration
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
    drawDoubleTriangles(canvas.current!);
  });

  return <canvas style={{ height: 600 }} ref={canvas} />;
}
