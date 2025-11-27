
// デフォルトの画像
let IMAGE_URL = 'https://search3958.github.io/newtab/bgimg/plate3.webp';

// localStorage に custom_wallpaper があればそれを使う
const customWallpaper = localStorage.getItem('custom_wallpaper');
if (customWallpaper) {
    IMAGE_URL = customWallpaper;
}

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
if(!gl){ document.body.innerHTML = '<p style="padding:20px;color:#f88">Error: WebGL が利用できません。</p>'; throw new Error('WebGL not supported'); }

// --- シェーダ ---
const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_amp;
uniform float u_freq;
uniform float u_speed;
uniform vec2 u_canvasSize;
uniform vec2 u_imageSize;

#define MAX_PULSES 8
uniform int u_pulseCount;
uniform vec3 u_pulses[MAX_PULSES];

vec2 coverUV(vec2 uv, vec2 canvasSize, vec2 imageSize) {
  float canvasAspect = canvasSize.x / canvasSize.y;
  float imageAspect = imageSize.x / imageSize.y;
  vec2 scale;
  if (canvasAspect > imageAspect) scale = vec2(1.0, canvasAspect / imageAspect);
  else scale = vec2(imageAspect / canvasAspect, 1.0);
  return (uv - 0.5) / scale + 0.5;
}

float pulseHeight(vec2 uv, vec2 origin, float t0, float t, vec2 canvasSize){
    float elapsed = t - t0;
    if(elapsed <= 0.0) return 0.0;

    float aspect = canvasSize.x / canvasSize.y;
    vec2 correctedUV = vec2(uv.x * aspect, uv.y);
    vec2 correctedOrigin = vec2(origin.x * aspect, origin.y);

    float d = distance(correctedUV, correctedOrigin);
    float r = elapsed * u_speed;
    float diff = d - r;
    float phase = diff * u_freq;

    // 減衰と立ち上がり
    float env = exp(-1.5 * abs(diff)) * exp(-0.8 * elapsed);

    // 追加: 立ち上がりを滑らかにする
    float rise = smoothstep(0.0, 0.3, elapsed); // 0.3 秒かけて徐々に立ち上がる
    // 必要に応じて easeIn のカーブも可能
    return sin(phase) * env * rise;
}


vec4 blurSample(sampler2D tex, vec2 uv, float strength){
    vec4 sum = vec4(0.0);
    float step = 0.003 * strength; // 強さ調整
    const int RADIUS = 4; // ← const にする

    float count = 0.0;
    for(int x=-RADIUS; x<=RADIUS; x++){
        for(int y=-RADIUS; y<=RADIUS; y++){
            sum += texture2D(tex, uv + vec2(float(x)*step, float(y)*step));
            count += 1.0;
        }
    }
    return sum / count;
}



float gradientLayer(vec2 uv){
  float grad = smoothstep(-0.15, 0.0, uv.y);
  return pow(grad, 0.5);
}

void main(){
  vec2 uv = v_uv;
  vec2 coverUv = coverUV(uv, u_canvasSize, u_imageSize);
  vec4 baseColor = texture2D(u_tex, coverUv);

  if(u_pulseCount <= 0){
    gl_FragColor = baseColor;
    return;
  }

  float t = u_time;
  float h = 0.0;
  for(int i=0;i<MAX_PULSES;i++){
    if(i >= u_pulseCount) break;
    vec3 p = u_pulses[i];
    h += pulseHeight(uv, p.xy, p.z, t, u_canvasSize);
  }

  float disp = h * u_amp;
  vec2 displacedUv = coverUv + normalize(uv - vec2(0.5,-0.05)) * disp * 0.06;
  float effect = clamp(abs(disp), 0.0, 1.0);

  if(effect < 0.015){
    gl_FragColor = baseColor;
    return;
  }

  vec2 offsetR = vec2(0.016,0.0) * effect;
  vec2 offsetB = vec2(-0.016,0.0) * effect;

vec4 col;
col.r = blurSample(u_tex, displacedUv + offsetR, effect).r;
col.g = blurSample(u_tex, displacedUv, effect).g;
col.b = blurSample(u_tex, displacedUv + offsetB, effect).b;
col.a = 1.0;
// 波紋の明るさを滑らかにする例
float gradEffect = smoothstep(0.0, 1.0, abs(disp)); // disp は波紋の高さ
float light = 1.0 + gradEffect * 0.6;

// 元の baseColor と波紋色をグラデーションでブレンド
float grad = gradientLayer(uv); // 既存関数
baseColor.rgb = mix(baseColor.rgb, col.rgb * light, grad);


  gl_FragColor = baseColor;
}
`;

// --- GL boilerplate ---
function compileShader(src, type){
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
    console.error(gl.getShaderInfoLog(s));
    throw new Error('Shader compile error');
  }
  return s;
}
function createProgram(vsSrc, fsSrc){
  const vs = compileShader(vsSrc, gl.VERTEX_SHADER);
  const fs = compileShader(fsSrc, gl.FRAGMENT_SHADER);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(prog));
    throw new Error('Program link error');
  }
  return prog;
}

const prog = createProgram(VERT_SRC, FRAG_SRC);
gl.useProgram(prog);

const quad = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
const a_pos = gl.getAttribLocation(prog, 'a_pos');
gl.enableVertexAttribArray(a_pos);
gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

// uniform locations
const u_time = gl.getUniformLocation(prog, 'u_time');
const u_tex = gl.getUniformLocation(prog, 'u_tex');
const u_amp = gl.getUniformLocation(prog, 'u_amp');
const u_freq = gl.getUniformLocation(prog, 'u_freq');
const u_speed = gl.getUniformLocation(prog, 'u_speed');
const u_pulseCount = gl.getUniformLocation(prog, 'u_pulseCount');
const u_pulses = gl.getUniformLocation(prog, 'u_pulses');
const u_canvasSize = gl.getUniformLocation(prog, 'u_canvasSize');
const u_imageSize = gl.getUniformLocation(prog, 'u_imageSize');

// texture loader
let texture = null;
let imageSize = {width:1, height:1};

function loadTexture(url, cb){
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = ()=>{
    imageSize.width = img.naturalWidth;
    imageSize.height = img.naturalHeight;
    
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    cb(tex);
  };
  img.onerror = ()=>{ console.error('Image failed to load'); cb(null); };
  img.src = url;
}

// --- pulse (1つだけ) ---
let pulse = null; // 1つだけ
const MAX_P = 8;
const pulsesBuf = new Float32Array(MAX_P * 3);

function addPulse(x,y){
  const now = performance.now() / 1000.0;
  pulse = {x:x, y:y, t0:now};
  drawFrame();
}

// UI
const btn = document.getElementById('pulse');
btn.addEventListener('click', ()=> addPulse(0.5, -0.05));

// resize
function resize(){
  const dpr = window.devicePixelRatio || 1;
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  if(canvas.width !== w || canvas.height !== h){
    canvas.width = w; canvas.height = h;
    gl.viewport(0,0,canvas.width,canvas.height);
  }
}
window.addEventListener('resize', resize);

// draw & loop
let raf = null;
function startLoop(){
  if(raf === null) raf = requestAnimationFrame(loop);
}
function loop(){
  drawFrame();
  raf = requestAnimationFrame(loop);
}
function stopLoop(){
  if(raf !== null){ cancelAnimationFrame(raf); raf = null; }
}

function drawFrame(){
  resize();

  const tNow = performance.now() / 1000.0;
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform1f(u_time, tNow);
  gl.uniform1f(u_amp, 2);
  gl.uniform1f(u_freq, 2); // 波の長さ
  gl.uniform1f(u_speed, 2.5);
  gl.uniform2f(u_canvasSize, canvas.width, canvas.height);
  gl.uniform2f(u_imageSize, imageSize.width, imageSize.height);

  // 1つだけ渡す
  if(pulse){
    pulsesBuf[0] = pulse.x;
    pulsesBuf[1] = pulse.y;
    pulsesBuf[2] = pulse.t0;
  }else{
    pulsesBuf[0] = 0.0;
    pulsesBuf[1] = 0.0;
    pulsesBuf[2] = -9999.0;
  }

  gl.uniform1i(u_pulseCount, pulse ? 1 : 0);
  gl.uniform3fv(u_pulses, pulsesBuf);

  if(texture){
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_tex,0);
  }

  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}

// load + start loop
loadTexture(IMAGE_URL, (tex)=>{
  if(!tex){ console.error('texture missing'); return; }
  texture = tex;
  startLoop();
});
