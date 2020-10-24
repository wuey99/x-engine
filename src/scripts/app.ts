//------------------------------------------------------------------------------------------
// app.ts
//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { FpsMeter } from './fps-meter';
import { XApp } from './app/XApp';
import { XWorld } from './sprite/XWorld';
import { XType } from './type/XType';
import { TestGameController } from './game/TestGameController';
import { SpriteSheetResource } from './resource/SpriteSheetResource';
import { SVGResource } from './resource/SVGResource';
import { G } from './app/G';
import { graphicsUtils } from 'pixi.js';
import * as Parser from 'fast-xml-parser';
(window as any).decomp = require('poly-decomp');

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
    g_XApp = new XApp ({
        containerId: 'game',
        canvasW: G.CANVAS_WIDTH,
        canvasH: G.CANVAS_HEIGHT,
        fpsMax: 60
    });
    
    world = new XWorld (g_XApp.stage, g_XApp, 8);
    world.setup ();
    g_XApp.stage.addChild (world);

    /* FPS */
    const fpsMeterItem = document.createElement('div');
    fpsMeterItem.classList.add ('fps');
    g_XApp.container.appendChild (fpsMeterItem);

    fpsMeter = new FpsMeter (() => {
        fpsMeterItem.innerHTML = 'FPS: ' + fpsMeter.getFrameRate().toFixed(2).toString();
    });

    setInterval (update, 1000.0 / g_XApp.fpsMax);
    render ();

    var __gameController:TestGameController = new TestGameController ();
    __gameController.setup (world, 0, 0.0);
    __gameController.afterSetup ();

    g_XApp.getXProjectManager ().registerType ("SpriteSheet", SpriteSheetResource);
    g_XApp.getXProjectManager ().registerType ("SVGResource", SVGResource);

    g_XApp.getXProjectManager ().setup ("assets/Common.xml");

    //------------------------------------------------------------------------------------------
    g_XApp.getXProjectManager ().loadResources ([
        //------------------------------------------------------------------------------------------
        // earth
        //------------------------------------------------------------------------------------------
        {
            name: "Earth_Layers_BackgroundX",
            type: "SVGResource",
            path: "backgrounds/Earth/earth-layers-background.svg"
        },
        {
            name: "Earth_Layers_PlatformX",
            type: "SVGResource",
            path: "backgrounds/Earth/earth-layers-platform.svg"
        },
        {
            name: "Earth_Sprites_ScoreBox",
            type: "SVGResource",
            path: "sprites/Earth/earth-sprites-score-box.svg"
        },
        {
            name: "Earth_Sprites_Mass",
            type: "SVGResource",
            path: "sprites/Earth/earth-sprites-mass.svg"
        },
        {
            name: "Earth_Sprites_Planet",
            type: "SVGResource",
            path: "sprites/Earth/earth-sprites-planet.svg"
        },
        {
            name: "Earth_Sprites_ForceGauge",
            type: "SVGResource",
            path: "sprites/Earth/earth-sprites-force-gauge.svg"
        },
        {
            name: "Earth_Sprites_ForceNeedle",
            type: "SVGResource",
            path: "sprites/Earth/earth-sprites-force-needle.svg"
        },
        {
            name: "Earth_Sprites_Ball",
            type: "SVGResource",
            path: "sprites/Earth/earth-sprites-ball.svg"
        },
        {
            name: "Earth_Sprites_Gauge",
            type: "SVGResource",
            path: "sprites/Earth/earth-sprites-gauge.svg"
        },

        //------------------------------------------------------------------------------------------
        // mars
        //------------------------------------------------------------------------------------------
        {
            name: "Mars_Layers_BackgroundX",
            type: "SVGResource",
            path: "backgrounds/Mars/mars-layers-background.svg"
        },
        {
            name: "Mars_Layers_PlatformX",
            type: "SVGResource",
            path: "backgrounds/Mars/mars-layers-platform.svg"
        },
        {
            name: "Mars_Sprites_ScoreBox",
            type: "SVGResource",
            path: "sprites/Mars/mars-sprites-score-box.svg"
        },
        {
            name: "Mars_Sprites_Mass",
            type: "SVGResource",
            path: "sprites/Mars/mars-sprites-mass.svg"
        },
        {
            name: "Mars_Sprites_Planet",
            type: "SVGResource",
            path: "sprites/Mars/mars-sprites-planet.svg"
        },
        {
            name: "Mars_Sprites_ForceGauge",
            type: "SVGResource",
            path: "sprites/Mars/mars-sprites-force-gauge.svg"
        },
        {
            name: "Mars_Sprites_ForceNeedle",
            type: "SVGResource",
            path: "sprites/Mars/mars-sprites-force-needle.svg"
        },
        {
            name: "Mars_Sprites_Ball",
            type: "SVGResource",
            path: "sprites/Mars/mars-sprites-ball.svg"
        },
        {
            name: "Mars_Sprites_Gauge",
            type: "SVGResource",
            path: "sprites/Mars/mars-sprites-gauge.svg"
        },

        //------------------------------------------------------------------------------------------
        // ice
        //------------------------------------------------------------------------------------------
        {
            name: "Ice_Layers_BackgroundX",
            type: "SVGResource",
            path: "background/Ice/ice-layers-background.svg"
        },
        {
            name: "Ice_Sprites_ScoreBox",
            type: "SVGResource",
            path: "sprites/Ice/Ice-sprites-score-box.svg"
        },
        {
            name: "Ice_Sprites_Mass",
            type: "SVGResource",
            path: "sprites/Ice/ice-sprites-mass.svg"
        },
        {
            name: "Ice_Sprites_Planet",
            type: "SVGResource",
            path: "sprites/Ice/ice-sprites-planet.svg"
        },
        {
            name: "Ice_Sprites_ForceGauge",
            type: "SVGResource",
            path: "sprites/Ice/ice-sprites-force-gauge.svg"
        },
        {
            name: "Ice_Sprites_ForceNeedle",
            type: "SVGResource",
            path: "sprites/Ice/ice-sprites-force-needle.svg"
        },
        {
            name: "Ice_Sprites_Ball",
            type: "SVGResource",
            path: "sprites/Ice/ice-sprites-ball.svg"
        },
        {
            name: "Ice_Sprites_Gauge",
            type: "SVGResource",
            path: "sprites/Ice/ice-sprites-gauge.svg"
        },

        //------------------------------------------------------------------------------------------
        // moon
        //------------------------------------------------------------------------------------------
        {
            name: "Moon_Layers_BackgroundX",
            type: "SVGResource",
            path: "backgrounds/Moon/moon-layers-background.svg"
        },
        {
            name: "Moon_Layers_PlatformX",
            type: "SVGResource",
            path: "backgrounds/Moon/moon-layers-platform.svg"
        },
        {
            name: "Moon_Sprites_ScoreBox",
            type: "SVGResource",
            path: "sprites/Moon/moon-sprites-score-box.svg"
        },
        {
            name: "Moon_Sprites_Mass",
            type: "SVGResource",
            path: "sprites/Moon/moon-sprites-mass.svg"
        },
        {
            name: "Moon_Sprites_Planet",
            type: "SVGResource",
            path: "sprites/Moon/moon-sprites-planet.svg"
        },
        {
            name: "Moon_Sprites_ForceGauge",
            type: "SVGResource",
            path: "sprites/Moon/moon-sprites-force-gauge.svg"
        },
        {
            name: "Moon_Sprites_ForceNeedle",
            type: "SVGResource",
            path: "sprites/Moon/moon-sprites-force-needle.svg"
        },
        {
            name: "Moon_Sprites_Ball",
            type: "SVGResource",
            path: "sprites/Moon/moon-sprites-ball.svg"
        },
        {
            name: "Moon_Sprites_Gauge",
            type: "SVGResource",
            path: "sprites/Moon/moon-sprites-gauge.svg"
        },

        //------------------------------------------------------------------------------------------
        // squid
        //------------------------------------------------------------------------------------------
        {
            name: "Squid_Layers_BackgroundX",
            type: "SVGResource",
            path: "background/Squid/squid-layers-background.svg"
        },
        {
            name: "Squid_Sprites_ScoreBox",
            type: "SVGResource",
            path: "sprites/Squid/squid-sprites-score-box.svg"
        },
        {
            name: "Squid_Sprites_Mass",
            type: "SVGResource",
            path: "sprites/Squid/squid-sprites-mass.svg"
        },
        {
            name: "Squid_Sprites_Planet",
            type: "SVGResource",
            path: "sprites/Squid/squid-sprites-planet.svg"
        },
        {
            name: "Squid_Sprites_ForceGauge",
            type: "SVGResource",
            path: "sprites/Squid/Squid-sprites-force-gauge.svg"
        },
        {
            name: "Squid_Sprites_ForceNeedle",
            type: "SVGResource",
            path: "sprites/Squid/squid-sprites-force-needle.svg"
        },
        {
            name: "Squid_Sprites_Ball",
            type: "SVGResource",
            path: "sprites/Squid/squid-sprites-ball.svg"
        },
        {
            name: "Squid_Sprites_Gauge",
            type: "SVGResource",
            path: "sprites/Squid/squid-sprites-gauge.svg"
        },
    ]);
} 

//------------------------------------------------------------------------------------------
function update () {
    fpsMeter.updateTime ();

    g_XApp.update ();

    world.update ();
}

//------------------------------------------------------------------------------------------
function render () {
    requestAnimationFrame (render);

    g_XApp.renderer.render (g_XApp.stage);

    fpsMeter.tick ();
}
