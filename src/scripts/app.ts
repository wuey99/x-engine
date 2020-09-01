//------------------------------------------------------------------------------------------
// app.ts
//------------------------------------------------------------------------------------------
// import * as PIXI from 'pixi.js';
import { FpsMeter } from './fps-meter';
import { XApp } from './app/XApp';
import { XWorld } from './sprite/XWorld';
// import { XType } from './type/XType';

//------------------------------------------------------------------------------------------
export var g_XApp:XApp;
export var world:XWorld;

let fpsMeter: FpsMeter;

//------------------------------------------------------------------------------------------
window.onload = load;

function load() {
    create();
} 

//------------------------------------------------------------------------------------------
function create() {
    g_XApp = new XApp({
        containerId: 'game',
        canvasW: 700,
        canvasH: 550,
        fpsMax: 60
    });
    
    world = new XWorld (g_XApp.stage, g_XApp, 8);
    world.setup ();
    g_XApp.stage.addChild (world);

    /* FPS */
    const fpsMeterItem = document.createElement('div');
    fpsMeterItem.classList.add('fps');
    g_XApp.container.appendChild(fpsMeterItem);

    fpsMeter = new FpsMeter(() => {
        fpsMeterItem.innerHTML = 'FPS: ' + fpsMeter.getFrameRate().toFixed(2).toString();
    });

    setInterval(update, 1000.0 / g_XApp.fpsMax);
    render();
} 

//------------------------------------------------------------------------------------------
function update() {
    fpsMeter.updateTime();

    g_XApp.update ();
    
    world.update ();
}

//------------------------------------------------------------------------------------------
function render() {
    requestAnimationFrame(render);

    g_XApp.renderer.render(g_XApp.stage);

    fpsMeter.tick();
}