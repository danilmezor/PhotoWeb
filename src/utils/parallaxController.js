// Shared single-canvas WebGL engine for the gallery hover depth-parallax.
//
// One canvas + one WebGL context for the whole app, *reparented into the
// hovered tile* (moving a canvas in the DOM preserves its GL context). This
// sidesteps the browser's ~16-live-context cap — the JMT grid alone has 47
// tiles — and gets overflow clipping, border-radius, and scroll-following
// from the tile's own CSS for free. Only one tile can be hovered by a fine
// pointer at a time, so one context is exactly enough; per-hover texture
// upload is a few ms.
//
// The shader shifts texture lookups by depth: near pixels (depth ~1) track
// the cursor, far pixels counter-shift, the PIVOT plane stays put. EDGE_ZOOM
// crops slightly so shifted edges never reveal void — the static <img>
// carries a matching CSS scale(1.06) (see Gallery.css) so the canvas
// fade-in causes no zoom jump.

const PARALLAX_STRENGTH = 0.02; // max UV shift for the nearest pixels
const PARALLAX_PIVOT = 0.4;     // depth value that stays still (0=far, 1=near)
export const EDGE_ZOOM = 1.06;  // must match the CSS pre-zoom on parallax tiles

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uImg;
uniform sampler2D uDepth;
uniform vec2 uCover;    // cover-fit scale (<=1 on the cropped axis)
uniform vec2 uMouse;    // smoothed cursor, -1..1, pre-multiplied by ramp
void main() {
  vec2 uv = 0.5 + (vUv - 0.5) * uCover / ${EDGE_ZOOM.toFixed(2)};
  float d = texture2D(uDepth, uv).r;
  vec2 off = uMouse * ${PARALLAX_STRENGTH.toFixed(3)} * (d - ${PARALLAX_PIVOT.toFixed(2)});
  gl_FragColor = texture2D(uImg, uv + off);
}`;

const depthCache = new Map(); // url -> Promise<HTMLImageElement>

const loadDepth = (url) => {
    if (!depthCache.has(url)) {
        const img = new Image();
        img.src = url;
        depthCache.set(url, img.decode().then(() => img));
    }
    return depthCache.get(url);
};

const state = {
    canvas: null,
    gl: null,
    isGL2: false,
    uMouse: null,
    uCover: null,
    texImg: null,
    texDepth: null,
    raf: 0,
    ready: false,
    hovering: false,
    activeTile: null,
    token: 0,
    tx: 0, ty: 0, mx: 0, my: 0, amount: 0,
};

function initGL() {
    const canvas = document.createElement('canvas');
    canvas.className = 'parallax-canvas';
    const gl = canvas.getContext('webgl2', { antialias: false, depth: false })
        || canvas.getContext('webgl', { antialias: false, depth: false });
    if (!gl) return false;

    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        // Drop everything; the next hover re-initializes from scratch.
        cancelAnimationFrame(state.raf);
        state.canvas = null;
        state.gl = null;
        state.ready = false;
        state.raf = 0;
        canvas.remove();
    });

    const prog = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        gl.attachShader(prog, sh);
    }
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i(gl.getUniformLocation(prog, 'uImg'), 0);
    gl.uniform1i(gl.getUniformLocation(prog, 'uDepth'), 1);

    state.canvas = canvas;
    state.gl = gl;
    state.isGL2 = typeof WebGL2RenderingContext !== 'undefined'
        && gl instanceof WebGL2RenderingContext;
    state.uMouse = gl.getUniformLocation(prog, 'uMouse');
    state.uCover = gl.getUniformLocation(prog, 'uCover');
    return true;
}

function makeTexture(unit, source, mipmap) {
    const { gl } = state;
    const t = gl.createTexture();
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    if (mipmap) {
        // Match the browser's own downscale filtering so the canvas is
        // indistinguishable from the static <img> at rest.
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
}

function freeTextures() {
    const { gl } = state;
    if (!gl) return;
    if (state.texImg) gl.deleteTexture(state.texImg);
    if (state.texDepth) gl.deleteTexture(state.texDepth);
    state.texImg = null;
    state.texDepth = null;
}

function frame() {
    const { gl } = state;
    if (!gl || !state.ready) {
        state.raf = 0;
        return;
    }
    state.mx += (state.tx - state.mx) * 0.1;
    state.my += (state.ty - state.my) * 0.1;
    state.amount += ((state.hovering ? 1 : 0) - state.amount) * 0.08;

    gl.uniform2f(state.uMouse, -state.mx * state.amount, state.my * state.amount);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!state.hovering && state.amount < 0.01) {
        // Fully ramped out: stop the loop, release the textures.
        state.ready = false;
        state.raf = 0;
        freeTextures();
        return;
    }
    state.raf = requestAnimationFrame(frame);
}

export async function enter(tile, imgEl, depthUrl) {
    if (!tile || !imgEl) return;
    if (!state.canvas && !initGL()) return;

    const token = ++state.token;
    state.activeTile = tile;
    state.hovering = true;
    state.mx = state.my = state.tx = state.ty = 0;
    state.amount = 0;
    state.ready = false;

    const { canvas, gl } = state;
    canvas.style.opacity = '0';
    if (canvas.parentNode !== tile) tile.appendChild(canvas);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = tile.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);

    try {
        const [depthImg] = await Promise.all([
            loadDepth(depthUrl),
            imgEl.complete ? Promise.resolve() : imgEl.decode(),
        ]);
        if (token !== state.token) return; // hover moved on mid-load

        freeTextures();
        state.texImg = makeTexture(gl.TEXTURE0, imgEl, state.isGL2);
        state.texDepth = makeTexture(gl.TEXTURE1, depthImg, false);

        // Same crop as CSS object-fit: cover / intrinsic-width layout.
        const ia = imgEl.naturalWidth / imgEl.naturalHeight;
        const ta = rect.width / rect.height;
        gl.uniform2f(state.uCover, ia > ta ? ta / ia : 1, ia > ta ? 1 : ia / ta);

        state.ready = true;
        canvas.style.opacity = '1';
        if (!state.raf) state.raf = requestAnimationFrame(frame);
    } catch {
        // Depth fetch/decode failed — tile silently keeps its static image.
    }
}

export function move(e) {
    const tile = state.activeTile;
    if (!tile || !state.hovering) return;
    const r = tile.getBoundingClientRect();
    state.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    state.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
}

export function leave(tile) {
    if (tile && tile !== state.activeTile) return; // stale leave from a previous tile
    state.token++; // cancel any in-flight enter() for this tile
    state.hovering = false;
    state.tx = 0;
    state.ty = 0;
    if (state.canvas) state.canvas.style.opacity = '0';
}
