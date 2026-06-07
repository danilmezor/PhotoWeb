import React, { useEffect, useRef } from 'react';

// Gaussian-splat viewer for the Lightbox's "View in 3D" mode.
//
// Loaded via React.lazy on the first 3D click — the playcanvas engine
// (its own chunk, dynamic-imported below) never touches the main bundle.
// Mounted once per lightbox session and kept alive across photo navigation:
// each photo's splat entity is cached in `holders` and toggled with
// entity.enabled, so re-entering 3D on a viewed photo is instant.
//
// The scene is SHARP's output: a metric, forward-facing gaussian field with
// the capture camera at the origin (OpenCV axes — y down, z forward — hence
// the 180° X rotation into engine space). The camera FOV comes from the
// photo's capture intrinsics (splat.fov, extracted by the pipeline) so the
// resting 3D view lines up 1:1 with the 2D photo.

const PARALLAX = 0.10; // m of camera travel toward the cursor
const FOCUS = 8;       // m — the depth plane that stays pinned

const SplatViewer = ({ photo, splat, active, frameRef, onLoaded, onError }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef(null); // { pc, app, camera, holders: {src: {entity}} }
    const pendingRef = useRef(null); // latest load/enable request, run when engine is up
    const callbacksRef = useRef({ onLoaded, onError });
    callbacksRef.current = { onLoaded, onError };

    // Engine setup / teardown — once per lightbox session.
    useEffect(() => {
        let disposed = false;
        const frame = frameRef.current;

        (async () => {
            const pc = await import('playcanvas');
            if (disposed) return;

            const app = new pc.Application(canvasRef.current, {
                graphicsDeviceOptions: { antialias: false, alpha: false },
            });
            app.setCanvasFillMode(pc.FILLMODE_NONE);
            app.setCanvasResolution(pc.RESOLUTION_AUTO);
            app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 2);
            app.start();

            const camera = new pc.Entity('camera');
            camera.addComponent('camera', {
                clearColor: new pc.Color(0.02, 0.02, 0.02),
                fov: 60,
                nearClip: 0.05,
                farClip: 400,
            });
            app.root.addChild(camera);

            const state = {
                pc, app, camera, holders: {},
                targetX: 0, targetY: 0, curX: 0, curY: 0,
            };
            stateRef.current = state;

            // Cursor-driven parallax rig: truck the camera, pivot on FOCUS.
            app.on('update', (dt) => {
                const k = 1 - Math.exp(-dt * 10);
                state.curX += (state.targetX - state.curX) * k;
                state.curY += (state.targetY - state.curY) * k;
                camera.setPosition(state.curX * PARALLAX, -state.curY * PARALLAX, 0);
                camera.lookAt(0, 0, -FOCUS);
            });

            state.onMove = (e) => {
                const r = frame.getBoundingClientRect();
                state.targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
                state.targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
            };
            state.onLeave = () => {
                state.targetX = 0;
                state.targetY = 0;
            };
            frame.addEventListener('pointermove', state.onMove);
            frame.addEventListener('pointerleave', state.onLeave);

            // Keep the canvas matched to the displayed image's box.
            const img = frame.querySelector('img');
            state.resize = () => {
                const r = (img || frame).getBoundingClientRect();
                if (r.width && r.height) {
                    app.resizeCanvas(Math.round(r.width), Math.round(r.height));
                }
            };
            state.observer = new ResizeObserver(state.resize);
            state.observer.observe(img || frame);
            state.resize();

            state.ready = true;
            pendingRef.current?.();
        })().catch((err) => {
            if (!disposed) callbacksRef.current.onError?.(err);
        });

        return () => {
            disposed = true;
            const state = stateRef.current;
            if (state) {
                state.observer?.disconnect();
                frame?.removeEventListener('pointermove', state.onMove);
                frame?.removeEventListener('pointerleave', state.onLeave);
                state.app?.destroy();
                stateRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Photo / activity changes: load (cached) + enable the right entity.
    useEffect(() => {
        const src = photo?.src;
        const run = () => {
            const state = stateRef.current;
            if (!state?.ready) return;
            const { pc, app, camera, holders } = state;

            Object.values(holders).forEach((h) => { h.entity.enabled = false; });
            if (!active || !src || !splat) return;

            const enable = () => {
                // The user may have navigated away while the asset loaded.
                if (!stateRef.current || stateRef.current !== state) return;
                camera.camera.fov = splat.fov;
                Object.values(holders).forEach((h) => { h.entity.enabled = false; });
                holders[src].entity.enabled = true;
                state.resize();
                callbacksRef.current.onLoaded?.(src);
            };

            if (holders[src]) {
                enable();
                return;
            }

            const asset = new pc.Asset(src, 'gsplat', { url: splat.sog });
            asset.on('load', () => {
                const entity = new pc.Entity(src);
                entity.addComponent('gsplat', { asset });
                // SHARP uses OpenCV camera axes (y down, z forward) — rotate
                // 180° about X into engine space (y up, camera looks -z).
                entity.setEulerAngles(180, 0, 0);
                entity.enabled = false;
                app.root.addChild(entity);
                holders[src] = { entity };
                enable();
            });
            asset.on('error', (err) => callbacksRef.current.onError?.(err, src));
            app.assets.add(asset);
            app.assets.load(asset);
        };

        // Engine boots asynchronously; always record the latest request so
        // init can flush it, and run now if the engine is already up.
        pendingRef.current = run;
        if (stateRef.current?.ready) run();
    }, [photo?.src, splat, active]);

    return <canvas ref={canvasRef} className="lightbox-3d-canvas" />;
};

export default SplatViewer;
