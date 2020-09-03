//------------------------------------------------------------------------------------------
// app.ts
//------------------------------------------------------------------------------------------
// import * as PIXI from 'pixi.js';
import { FpsMeter } from './fps-meter';
import { XApp } from './app/XApp';
import { XWorld } from './sprite/XWorld';
import { XType } from './type/XType';
import { TestGameController } from './game/TestGameController';
import { SpriteSheetResource } from './resource/SpriteSheetResource';
import { G } from './app/G';

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
        canvasW: G.SCREEN_WIDTH,
        canvasH: G.SCREEN_HEIGHT,
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

    var __gameController:TestGameController = new TestGameController ();
    __gameController.setup (world, 0, 0.0);
    __gameController.afterSetup ();

    g_XApp.getXProjectManager ().registerType ("SpriteSheet", SpriteSheetResource);

    g_XApp.getXProjectManager ().loadResources ([
        {
            name: "OctopusBug",
            type: "SpriteSheet",
            path: "images/OctopusBug.json"
        },
    ])
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
