export function getGLContext(
  canvas: HTMLCanvasElement,
  bgColor: [number, number, number, number] = [1, 1, 1, 1]
): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2')!;

  // Set the output resolution and viewport
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = pixelRatio * canvas.clientWidth;
  canvas.height = pixelRatio * canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Initialize other WebGL states
  gl.clearColor(...bgColor);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  gl.lineWidth(1.0);

  return gl;
}

export function compileShader(
  gl: WebGL2RenderingContext,
  shaderSource: string,
  shaderType: number
): WebGLShader {
  const shader = gl.createShader(shaderType)!;

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  return shader;
}

export function linkProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const program = gl.createProgram()!;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
  }

  return program;
}
