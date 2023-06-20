// import './style';
// import { render } from 'preact';
import { useRef, useEffect } from 'react';
import * as webGL from './WebGLUtils';

function drawTriangle(
  canvas: HTMLCanvasElement,
  vertices: number[],
  vertexShader: string,
  fragmentShader: string
) {
  const gl = webGL.getGLContext(canvas, [0.0, 0.8, 0.8, 1]);
  const vs = webGL.compileShader(gl, vertexShader, gl.VERTEX_SHADER);
  const fs = webGL.compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
  const program = webGL.useProgram(gl, vs, fs);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // Use data from this vertex buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(program, 'position'); // Get the position attribute location
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0); // Pull out 2 FLOATs per iteration
  gl.enableVertexAttribArray(pos);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export default function App() {
  const canvas = useRef(null as HTMLCanvasElement | null);

  // top left: (-1, 1), bottom right: (1, -1)
  const vertices = [-1, -1, 0, 1, 1, -1];

  // Write vertex shaders
  const vertexShader = `#version 300 es
  precision mediump float;
  in vec2 position;

  void main () {
      gl_Position = vec4(position.x, position.y, 0.0, 1.0); // x,y,z,w
  }
`;

  // Write fragment shaders
  const fragmentShader = `#version 300 es
  precision mediump float;
  out vec4 color;

  void main () {
      color = vec4(0.5, 0.9, 0.5, 1.0); // light green
  }
`;

  useEffect(() => {
    drawTriangle(canvas.current!, vertices, vertexShader, fragmentShader);
  });

  return <canvas ref={canvas} />;
}
