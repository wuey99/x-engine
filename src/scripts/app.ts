//------------------------------------------------------------------------------------------
// app.ts
//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { FpsMeter } from './fps-meter';
import { XApp } from '../engine/app/XApp';
import { XWorld } from '../engine/sprite/XWorld';
import { XType } from '../engine/type/XType';
import { GolfGameController } from './game/GolfGameController';
import { SpriteSheetResource } from '../engine/resource/SpriteSheetResource';
import { ImageResource } from '../engine/resource/ImageResource';
import { SoundResource } from '../engine/resource/SoundResource';
import { G } from '../engine/app/G';
import { graphicsUtils } from 'pixi.js';
import * as Parser from 'fast-xml-parser';
import { XTask } from '../engine/task/XTask';
import { XGameController } from '../engine/state/XGameController';
(window as any).decomp = require('poly-decomp');

//------------------------------------------------------------------------------------------
export var g_XApp:XApp;
export var world:XWorld;

let fpsMeter: FpsMeter;

//------------------------------------------------------------------------------------------
window.onload = () => {
    var __main:Main = new Main ({});
    __main.setup ();
} 

//------------------------------------------------------------------------------------------
export class Main {
    public m_gameController:XGameController;
    public m_onStateChange:any;

//------------------------------------------------------------------------------------------
    constructor (__params:any) {
        this.m_onStateChange = __params.onStateChange;

        console.log (": Main: new: ",  this.m_onStateChange);

        return;
        
        this.m_onStateChange ({
            world: "world",
            terrain: "terrain",
            score: "score",
            duration: "duration",
            language: "language",
            attempts: "attempts",
            action: "attempts"
        });
    }

//------------------------------------------------------------------------------------------
    public setup (__container:HTMLElement = null):void {
        g_XApp = new XApp (
            {
                containerId: 'game',
                canvasW: G.CANVAS_WIDTH,
                canvasH: G.CANVAS_HEIGHT,
                fpsMax: 60
            },

            __container
        );

        console.log (": starting: ");

        // return;
        
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

        setInterval (this.update.bind (this), 1000.0 / g_XApp.fpsMax);
        this.render ();

        this.startApp ();
    }

//------------------------------------------------------------------------------------------
    public pause ():void {
        console.log (": pause: ");

        g_XApp.pause ();
    }

//------------------------------------------------------------------------------------------
    public resume ():void {
        console.log (": resume: ");

        g_XApp.resume ();
    }

//------------------------------------------------------------------------------------------
    public reset ():void {
        console.log (": reset: ");

        this.m_gameController.nuke ();
    
        this.m_gameController = new GolfGameController ();
        this.m_gameController.setup (world, 0, 0.0);
        this.m_gameController.afterSetup ();
    }

//------------------------------------------------------------------------------------------
    public update () {
        fpsMeter.updateTime ();

        g_XApp.update ();

        world.update ();

        world.clearCollisions ();

        world.updateCollisions ();
    }

//------------------------------------------------------------------------------------------
    public render () {
        requestAnimationFrame (this.render.bind (this));

        g_XApp.renderer.render (g_XApp.stage);

        fpsMeter.tick ();
    }

//------------------------------------------------------------------------------------------
    public setTerrainXML (__xml:any):void {
        console.log (": setTerrainXML: ", __xml);
    }

//------------------------------------------------------------------------------------------
    public setWorldXML (__xml:any):void {
        console.log (": setWorldXML: ", __xml);
    }
    
//------------------------------------------------------------------------------------------
    public startApp ():void {
        this.m_gameController = new GolfGameController ();
        this.m_gameController.setup (world, 0, 0.0);
        this.m_gameController.afterSetup ();

        g_XApp.getXProjectManager ().registerType ("SpriteSheet", SpriteSheetResource);
        g_XApp.getXProjectManager ().registerType ("ImageResource", ImageResource);
        g_XApp.getXProjectManager ().registerType ("SoundResource", SoundResource);

        const assetPrefix = process.env.REACT_APP_ASSET_DIRECTORY || '';

        /*
        g_XApp.getXProjectManager ().setup (
            "assets/Common.xml",
            {
                "images": "images",
                "assets": `${assetPrefix}assets/Cows/Project`,
                "levels": `${assetPrefix}assets/levels`,
                "sounds": `${assetPrefix}assets/sounds`,
                "music": `${assetPrefix}assets/music`,
                "backgrounds": `${assetPrefix}assets/backgrounds`,
                "sprites": `${assetPrefix}assets/sprites`
            }
        );
        */

        g_XApp.getXProjectManager ().setup (
            "assets/Common.xml",
            {

            }
        );

        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().loadResources ([
            
            //------------------------------------------------------------------------------------------
            // earth
            //------------------------------------------------------------------------------------------
            {
                name: "Earth_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Earth/earth-layers-background.svg"
            },
            {
                name: "Earth_Layers_PlatformX",
                type: "ImageResource",
                path: "backgrounds/Earth/earth-layers-platform.svg"
            },
            {
                name: "Earth_Sprites_ScoreBox",
                type: "ImageResource",
                path: "sprites/Earth/earth-sprites-score-box.svg"
            },
            {
                name: "Earth_Sprites_Mass",
                type: "ImageResource",
                path: "sprites/Earth/earth-sprites-mass.svg"
            },
            {
                name: "Earth_Sprites_Planet",
                type: "ImageResource",
                path: "sprites/Earth/earth-sprites-planet.svg"
            },
            {
                name: "Earth_Sprites_ForceGauge",
                type: "ImageResource",
                path: "sprites/Earth/earth-sprites-force-gauge.svg"
            },
            {
                name: "Earth_Sprites_ForceNeedle",
                type: "ImageResource",
                path: "sprites/Earth/earth-sprites-force-needle.svg"
            },
            {
                name: "Earth_Sprites_Ball",
                type: "ImageResource",
                path: "sprites/Earth/earth-sprites-ball.svg"
            },
            {
                name: "Earth_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Earth/earth-sprites-gauge.png"
            },

            //------------------------------------------------------------------------------------------
            // mars
            //------------------------------------------------------------------------------------------
            {
                name: "Mars_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Mars/mars-layers-background.svg"
            },
            {
                name: "Mars_Layers_PlatformX",
                type: "ImageResource",
                path: "backgrounds/Mars/mars-layers-platform.svg"
            },
            {
                name: "Mars_Sprites_ScoreBox",
                type: "ImageResource",
                path: "sprites/Mars/mars-sprites-score-box.svg"
            },
            {
                name: "Mars_Sprites_Mass",
                type: "ImageResource",
                path: "sprites/Mars/mars-sprites-mass.svg"
            },
            {
                name: "Mars_Sprites_Planet",
                type: "ImageResource",
                path: "sprites/Mars/mars-sprites-planet.svg"
            },
            {
                name: "Mars_Sprites_ForceGauge",
                type: "ImageResource",
                path: "sprites/Mars/mars-sprites-force-gauge.svg"
            },
            {
                name: "Mars_Sprites_ForceNeedle",
                type: "ImageResource",
                path: "sprites/Mars/mars-sprites-force-needle.svg"
            },
            {
                name: "Mars_Sprites_Ball",
                type: "ImageResource",
                path: "sprites/Mars/mars-sprites-ball.svg"
            },
            {
                name: "Mars_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Mars/mars-sprites-gauge.svg"
            },
            {
                name: "Mars_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Mars/mars-sprites-gauge.png"
            },

            //------------------------------------------------------------------------------------------
            // ice
            //------------------------------------------------------------------------------------------
            {
                name: "Ice_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Ice/ice-layers-background.svg"
            },
            {
                name: "Ice_Sprites_ScoreBox",
                type: "ImageResource",
                path: "sprites/Ice/ice-sprites-score-box.svg"
            },
            {
                name: "Ice_Sprites_Mass",
                type: "ImageResource",
                path: "sprites/Ice/ice-sprites-mass.svg"
            },
            {
                name: "Ice_Sprites_Planet",
                type: "ImageResource",
                path: "sprites/Ice/ice-sprites-planet.svg"
            },
            {
                name: "Ice_Sprites_ForceGauge",
                type: "ImageResource",
                path: "sprites/Ice/ice-sprites-force-gauge.svg"
            },
            {
                name: "Ice_Sprites_ForceNeedle",
                type: "ImageResource",
                path: "sprites/Ice/ice-sprites-force-needle.svg"
            },
            {
                name: "Ice_Sprites_Ball",
                type: "ImageResource",
                path: "sprites/Ice/ice-sprites-ball.svg"
            },
            {
                name: "Ice_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Ice/ice-sprites-gauge.svg"
            },
            {
                name: "Ice_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Ice/ice-sprites-gauge.png"
            },

            //------------------------------------------------------------------------------------------
            // moon
            //------------------------------------------------------------------------------------------
            {
                name: "Moon_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Moon/moon-layers-background.svg"
            },
            {
                name: "Moon_Layers_PlatformX",
                type: "ImageResource",
                path: "backgrounds/Moon/moon-layers-platform.svg"
            },
            {
                name: "Moon_Sprites_ScoreBox",
                type: "ImageResource",
                path: "sprites/Moon/moon-sprites-score-box.svg"
            },
            {
                name: "Moon_Sprites_Mass",
                type: "ImageResource",
                path: "sprites/Moon/moon-sprites-mass.svg"
            },
            {
                name: "Moon_Sprites_Planet",
                type: "ImageResource",
                path: "sprites/Moon/moon-sprites-planet.svg"
            },
            {
                name: "Moon_Sprites_ForceGauge",
                type: "ImageResource",
                path: "sprites/Moon/moon-sprites-force-gauge.svg"
            },
            {
                name: "Moon_Sprites_ForceNeedle",
                type: "ImageResource",
                path: "sprites/Moon/moon-sprites-force-needle.svg"
            },
            {
                name: "Moon_Sprites_Ball",
                type: "ImageResource",
                path: "sprites/Moon/moon-sprites-ball.svg"
            },
            {
                name: "Moon_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Moon/moon-sprites-gauge.svg"
            },
            {
                name: "Moon_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Moon/moon-sprites-gauge.png"
            },

            //------------------------------------------------------------------------------------------
            // squid
            //------------------------------------------------------------------------------------------
            {
                name: "Squid_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Squid/squid-layers-background.svg"
            },
            {
                name: "Squid_Sprites_ScoreBox",
                type: "ImageResource",
                path: "sprites/Squid/squid-sprites-score-box.svg"
            },
            {
                name: "Squid_Sprites_Mass",
                type: "ImageResource",
                path: "sprites/Squid/squid-sprites-mass.svg"
            },
            {
                name: "Squid_Sprites_Planet",
                type: "ImageResource",
                path: "sprites/Squid/squid-sprites-planet.svg"
            },
            {
                name: "Squid_Sprites_ForceGauge",
                type: "ImageResource",
                path: "sprites/Squid/squid-sprites-force-gauge.svg"
            },
            {
                name: "Squid_Sprites_ForceNeedle",
                type: "ImageResource",
                path: "sprites/Squid/squid-sprites-force-needle.svg"
            },
            {
                name: "Squid_Sprites_Ball",
                type: "ImageResource",
                path: "sprites/Squid/squid-sprites-ball.svg"
            },
            {
                name: "Squid_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Squid/squid-sprites-gauge.svg"
            },
            {
                name: "Squid_Sprites_Gauge",
                type: "ImageResource",
                path: "sprites/Squid/squid-sprites-gauge.png"
            },

            //------------------------------------------------------------------------------------------
            // common art
            //------------------------------------------------------------------------------------------
            {
                name: "Common_Sprites_HoleArrow",
                type: "ImageResource",
                path: "sprites/Common/common-sprites-hole-arrow.svg"
            },
            {
                name: "Common_Sprites_Reticle",
                type: "ImageResource",
                path: "sprites/Common/common-sprites-reticle.svg"
            },
            {
                name: "Common_Sprites_ElectricBeam",
                type: "ImageResource",
                path: "sprites/Common/common-sprites-electric-beam.svg"
            },
            {
                name: "Common_Sprites_BallHoleFlash",
                type: "ImageResource",
                path: "sprites/Common/common-sprites-ball-in-hole-flash.svg"
            },
            {
                name: "Common_Sprites_BallBorderFlash",
                type: "ImageResource",
                path: "sprites/Common/common-sprites-ball-border-flash.svg"
            },

            //------------------------------------------------------------------------------------------
            // common sounds
            //------------------------------------------------------------------------------------------
            {
                name: "Common_Sound_BallInHole",
                type: "SoundResource",
                path: "sounds/ball-in-hole.mp3"
            },
            {
                name: "Common_Sound_BallReappears",
                type: "SoundResource",
                path: "sounds/ball-reappears.mp3"
            },
            {
                name: "Common_Sound_BallExplosion",
                type: "SoundResource",
                path: "sounds/explosion-after-ball-in-hole.mp3"
            },
            {
                name: "Common_Sound_HoverState",
                type: "SoundResource",
                path: "sounds/hover-state-button_1.mp3"
            },
            {
                name: "Common_Sound_PressStartButton",
                type: "SoundResource",
                path: "sounds/press-state-start_button.mp3"
            },
            {
                name: "Common_Sound_BallHitTerrain1",
                type: "SoundResource",
                path: "sounds/ball-hit-terrain-1.mp3"
            },
            {
                name: "Common_Sound_BallHitTerrain2",
                type: "SoundResource",
                path: "sounds/ball-hit-terrain-2.mp3"
            },
            {
                name: "Common_Sound_BallHitTerrain3",
                type: "SoundResource",
                path: "sounds/ball-hit-terrain-3.mp3"
            },
            {
                name: "Common_Sound_BallHitTerrain4",
                type: "SoundResource",
                path: "sounds/ball-hit-terrain-4.mp3"
            },
            {
                name: "Common_Sound_BallLaunched",
                type: "SoundResource",
                path: "sounds/ball-launched.mp3"
            },
            {
                name: "Common_Sound_OffScreen",
                type: "SoundResource",
                path: "sounds/ball-off-screen.mp3"
            },

            //------------------------------------------------------------------------------------------
            // common music
            //------------------------------------------------------------------------------------------
            {
                name: "Common_Music_EarthBGM",
                type: "SoundResource",
                path: "music/earth-bgm.mp3"
            },
            {
                name: "Common_Music_MoonBGM",
                type: "SoundResource",
                path: "music/moon-bgm.mp3"
            },
            {
                name: "Common_Music_MarsBGM",
                type: "SoundResource",
                path: "music/mars-bgm.mp3"
            },
            {
                name: "Common_Music_IceBGM",
                type: "SoundResource",
                path: "music/ice-bgm.mp3"
            },
            {
                name: "Common_Music_SquidBGM",
                type: "SoundResource",
                path: "music/squid-bgm.mp3"
            },
        ]);
    }
}
