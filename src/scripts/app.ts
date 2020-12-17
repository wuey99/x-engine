//------------------------------------------------------------------------------------------
// app.ts
//------------------------------------------------------------------------------------------
import { G } from '../engine/app/G';
import { XApp } from '../engine/app/XApp';
import { ImageResource } from '../engine/resource/ImageResource';
import { MusicResource } from '../engine/resource/MusicResource';
import { SoundResource } from '../engine/resource/SoundResource';
import { SpriteSheetResource } from '../engine/resource/SpriteSheetResource';
import { ResourceSpec } from '../engine/resource/XResourceManager';
import { XWorld } from '../engine/sprite/XWorld';
import { XGameController } from '../engine/state/XGameController';
import { TerrainEditor } from './editor/TerrainEditor';
import { FpsMeter } from './fps-meter';
import { GameEditorController } from './game/GameEditorController';
import { GolfGame } from './game/GolfGame';
import { GolfGameController } from './game/GolfGameController';
import { TestGameController } from './test/TestGameController';
import { XSignal } from '../engine/signals/XSignal';

//------------------------------------------------------------------------------------------
(window as any).decomp = require('poly-decomp');

//------------------------------------------------------------------------------------------
export var g_XApp:XApp;
export var world:XWorld;

let fpsMeter: FpsMeter;

//------------------------------------------------------------------------------------------
window.onload = () => {
    var __main:Main = new Main (
        {
            onStateChange: () => {}
        }
    );

    __main.setup ();
} 

//------------------------------------------------------------------------------------------
export class Main {
    public m_gameController:XGameController;
    public m_onStateChange:any;
    public m_layersXMLString:string;
    public m_terrainXMLString:string;
    public m_levelData:any;
    public m_worldGravity:number;
    public m_worldMass:number;
    public m_score:number;
    public editingFlag:boolean;
    public m_debugMessage:string;
    public m_localizations:any;
    public m_currentLanguage:string;
    public m_intervalTimer:any;
    public fpsMeterItem:any;
    public m_delay:number;

//------------------------------------------------------------------------------------------
    constructor (__params:any) {
        this.m_onStateChange = __params.onStateChange;

        console.log (": localization: ", __params.localizations);

        this.m_localizations = __params.localizations;
        this.m_currentLanguage = "languages/39";

        G.main = this;
    }

//------------------------------------------------------------------------------------------
    public setup (__container:HTMLElement = null):void {
        g_XApp = new XApp (
            this,
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

        this.m_debugMessage = "";

        /* FPS */
        this.fpsMeterItem = document.createElement('div');
        this.fpsMeterItem.classList.add ('fps');
        g_XApp.container.appendChild (this.fpsMeterItem);

        fpsMeter = new FpsMeter (() => {
            this.fpsMeterItem.innerHTML = 'FPS: ' + fpsMeter.getFrameRate().toFixed(2).toString() + " : " + this.m_debugMessage;
        });

        this.m_intervalTimer = setInterval (this.update.bind (this), 1000.0 / g_XApp.fpsMax);
        this.render ();

        this.configureAndLoadAssets ();

        this.editingFlag = false;
        
        this.m_worldGravity = 9.8;
        this.m_worldMass = 1;
        this.m_score = 0;
        
        this.m_levelData = {
            name: "Earth",
            world: null,
            terrain: null,
            gravity: 9.8,
            mass: 1,
            title: "Earth",
            physics: {
                airFriction: "0.01",
                ballFriction: "0.1",
                ballMass: "1",
                ballRestitution: "0.8",
                terrainFriction: "0.1",
                terrainRestitution: "0",
                worldGravity: "9.81"
            }
        };
   
        this.m_delay = 0;

        this.reset ();
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        g_XApp.container.removeChild (this.fpsMeterItem);

        clearInterval (this.m_intervalTimer);

        if (this.m_gameController != null) {
            this.m_gameController.nuke ();

            this.m_gameController = null;
        }

        world.cleanup ();
        
        g_XApp.stage.removeChild (world);

        g_XApp.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public fatalError (__message:string):void {
        this.m_onStateChange (
            {
                fatalError: __message
            }
        );
    }
    
//------------------------------------------------------------------------------------------
    public setDebugMessage (__message:string):void {
        this.m_debugMessage = __message;
    }

//------------------------------------------------------------------------------------------
    public setLanguage (__language:string):void {
        this.m_currentLanguage = __language;

        if (!this.editingFlag) {
            var __golfGame:GolfGame = this.m_gameController.getGameInstance ().getGameStateObject () as GolfGame;
            if (__golfGame != null) {
                __golfGame.setLanguage (this.m_currentLanguage);
            }
        };    
    }

//------------------------------------------------------------------------------------------
    public getTranslation (__message:string):string {
        return __message;

        // return this.m_localizations[this.m_currentLanguage][__message];
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

        g_XApp.resume ();

        if (this.m_gameController != null) {
            this.m_gameController.nuke ();

            this.m_gameController = null;
        }

        this.m_gameController = new TestGameController ();
        this.m_gameController.setup (world, 0, 0.0);
        this.m_gameController.afterSetup ([]);

        this.m_delay = 30;
    }

//------------------------------------------------------------------------------------------
    public setMusic (__on:boolean):void {
        console.log (": music: ", __on);

        g_XApp.muteMusic (!__on);
    }

//------------------------------------------------------------------------------------------
    public setSound (__on:boolean):void {
        console.log (": sound: ", __on);

        g_XApp.muteSFX (!__on);
    }

//------------------------------------------------------------------------------------------
    public editing (__editing:boolean):void {
        console.log (": editing: ", __editing);

        if (!this.isReady ()) {
            return;
        }

        /*
        if (__editing) {
            this.cleanup ();
        }

        return;
        */

        if (
            this.m_gameController != null &&
            this.m_gameController.getGameInstance () != null &&
            this.m_gameController.getGameInstance ().getGameStateObject () != null
        ) {
            if (this.editingFlag) {
                var __terrainEditor:TerrainEditor = this.m_gameController.getGameInstance ().getGameStateObject () as TerrainEditor;
                console.log (": terrainEditor: xml: ", __terrainEditor.serializeLayers ().toXMLString (), __terrainEditor.serializeTerrain ().toXMLString ());

                this.m_layersXMLString = __terrainEditor.serializeLayers ().toXMLString ();
                this.m_terrainXMLString = __terrainEditor.serializeTerrain ().toXMLString ();
            } else {
                if (this.m_gameController.getGameInstance ().getGameStateObject () instanceof GolfGame) {
                    var __golfGame:GolfGame = this.m_gameController.getGameInstance ().getGameStateObject () as GolfGame;
                    if (__golfGame != null) {
                        this.m_layersXMLString = __golfGame.getLayersXML ().toXMLString ();
                        this.m_terrainXMLString = __golfGame.getTerrainXML ().toXMLString ();

                        console.log (": golfGame: xml: ", this.m_layersXMLString, this.m_terrainXMLString);
                    }
                }
            }
        }

        this.editingFlag = __editing;

        this.reset ();
    }

//------------------------------------------------------------------------------------------
    public isReady ():boolean {
        return this.m_delay == 0;
    }

//------------------------------------------------------------------------------------------
    public update () {
        if (this.m_delay > 0) {
            this.m_delay--;
        }

        if (!g_XApp.hasFocus ()) {
            return;
        }

        fpsMeter.updateTime ();

        g_XApp.update ();

        world.update ();

        world.clearCollisions ();

        world.updateCollisions ();
    }

//------------------------------------------------------------------------------------------
    public render () {
        console.log (": render: ");

        if (g_XApp.renderer == null) {
            return;
        }
        
        requestAnimationFrame (this.render.bind (this));

        g_XApp.renderer.render (g_XApp.stage);

        fpsMeter.tick ();
    }

//------------------------------------------------------------------------------------------
    public setLevel (__levelData:any):void {
        console.log (": levelData: ", __levelData);

        this.m_layersXMLString = __levelData.world;
        this.m_terrainXMLString = __levelData.terrain;

        this.m_levelData = {
            name: __levelData.name,
            world: __levelData.world,
            terrain: __levelData.terrain,
            gravity: __levelData.gravity,
            mass: __levelData.mass,
            title: __levelData.title,
            physics: __levelData.physics
        };
    }
    
//------------------------------------------------------------------------------------------
/*
    airFriction: "0.01"
    ballFriction: "0.1"
    ballMass: "1"
    ballRestitution: "0.8"
    terrainFriction: "0.1"
    terrainRestitution: "0"
    worldGravity: "9.81"
*/

//------------------------------------------------------------------------------------------
    public setPhysics (__physicsData:any):void {
        if (!this.editingFlag) {
            var __golfGame:GolfGame = this.m_gameController.getGameInstance ().getGameStateObject () as GolfGame;
            if (__golfGame != null) {
                __golfGame.setPhysics (__physicsData);
            }
        };
    }

//------------------------------------------------------------------------------------------
    public setScore (__score:number):void {
        console.log (": score: ", __score);

        this.m_score = __score;

        if (this.m_gameController == null ||  this.m_gameController.getGameInstance () == null) {
            return;
        }

        if (!this.editingFlag) {
            var __golfGame:GolfGame = this.m_gameController.getGameInstance ().getGameStateObject () as GolfGame;
            if (__golfGame != null) {
                __golfGame.setScore (__score);
            }
        }
    }

//------------------------------------------------------------------------------------------
    public configureAndLoadAssets ():void {
        g_XApp.getXProjectManager ().registerType ("SpriteSheet", SpriteSheetResource);
        g_XApp.getXProjectManager ().registerType ("ImageResource", ImageResource);
        g_XApp.getXProjectManager ().registerType ("SoundResource", SoundResource);
        g_XApp.getXProjectManager ().registerType ("MusicResource", MusicResource);

        const assetPrefix = process.env.REACT_APP_ASSET_DIRECTORY || '';

        g_XApp.getXProjectManager ().setup (
            "assets/Common.xml",
            {
                /*
                "images": "images",
                "assets": `${assetPrefix}assets/Cows/Project`,
                "levels": `${assetPrefix}assets/levels`,
                "sounds": `${assetPrefix}assets/sounds`,
                "music": `${assetPrefix}assets/music`,
                "backgrounds": `${assetPrefix}assets/backgrounds`,
                "sprites": `${assetPrefix}assets/sprites`,
                */
            },
            () => {
                this.queuePreloadResources ();
                this.queueCommonResources ();
                this.queueEarthResources (g_XApp.getXProjectManager ().extractAssetsFromCow (["Earth_Terrain", "Earth_Sprites"]));
                this.queueMoonResources (g_XApp.getXProjectManager ().extractAssetsFromCow (["Moon_Terrain", "Moon_Sprites"]));
                this.queueMarsResources (g_XApp.getXProjectManager ().extractAssetsFromCow (["Mars_Terrain", "Mars_Sprites"]));
                this.queueIceResources (g_XApp.getXProjectManager ().extractAssetsFromCow (["Ice_Terrain", "Ice_Sprites"]));
                this.queueSquidResources (g_XApp.getXProjectManager ().extractAssetsFromCow (["Squid_Terrain", "Squid_Sprites"]));

                g_XApp.getXProjectManager ().loadCowResources ();
            }
        );
    }
    
//------------------------------------------------------------------------------------------
    public queueEarthResources (__fromCow:Array<ResourceSpec>):void {

        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([
            
            //------------------------------------------------------------------------------------------
            // earth
            //------------------------------------------------------------------------------------------
            /*
            {
                name: "Earth_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Earth/earth-layers-background-cropped.svg"
            },
            */
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
            {
                name: "Common_Music_EarthBGM",
                type: "SoundResource",
                path: "music/earth-bgm.mp3"
            },
        ].concat (__fromCow), "Earth");
    }

//------------------------------------------------------------------------------------------
    public queueMarsResources (__fromCow:Array<ResourceSpec>):void {
            
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // mars
            //------------------------------------------------------------------------------------------
            /*
            {
                name: "Mars_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Mars/mars-layers-background-cropped.svg"
            },
            */
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
                path: "sprites/Mars/mars-sprites-gauge.png"
            },
            {
                name: "Common_Music_MarsBGM",
                type: "SoundResource",
                path: "music/mars-bgm.mp3"
            },
        ].concat (__fromCow), "Mars");
    }

//------------------------------------------------------------------------------------------
    public queueIceResources (__fromCow:Array<ResourceSpec>):void {
            
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // ice
            //------------------------------------------------------------------------------------------
            /*
            {
                name: "Ice_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Ice/ice-layers-background-cropped.svg"
            },
            */
            {
                name: "Ice_Layers_PlatformX",
                type: "ImageResource",
                path: "backgrounds/Ice/ice-layers-platform.svg"
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
                path: "sprites/Ice/ice-sprites-gauge.png"
            },
            {
                name: "Common_Music_IceBGM",
                type: "SoundResource",
                path: "music/ice-bgm.mp3"
            },
        ].concat (__fromCow), "Ice");
    }

//------------------------------------------------------------------------------------------
    public queueMoonResources (__fromCow:Array<ResourceSpec>):void {
            
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // moon
            //------------------------------------------------------------------------------------------
            /*
            {
                name: "Moon_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Moon/moon-layers-background-cropped.svg"
            },
            */
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
                path: "sprites/Moon/moon-sprites-gauge.png"
            },
            {
                name: "Common_Music_MoonBGM",
                type: "SoundResource",
                path: "music/moon-bgm.mp3"
            },
        ].concat (__fromCow), "Moon");
    }

//------------------------------------------------------------------------------------------
    public queueSquidResources (__fromCow:Array<ResourceSpec>):void {
            
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // squid
            //------------------------------------------------------------------------------------------
            /*
            {
                name: "Squid_Layers_BackgroundX",
                type: "ImageResource",
                path: "backgrounds/Squid/squid-layers-background-cropped.svg"
            },
            */ 
            {
                name: "Squid_Layers_PlatformX",
                type: "ImageResource",
                path: "backgrounds/Squid/squid-layers-platform.svg"
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
                path: "sprites/Squid/squid-sprites-gauge.png"
            },
            {
                name: "Common_Music_SquidBGM",
                type: "SoundResource",
                path: "music/squid-bgm.mp3"
            },
        ].concat (__fromCow), "Squid");
    }

//------------------------------------------------------------------------------------------
    public queueCommonResources ():void {
            
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

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
            /*
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
            */
        ], "Common");
    }

//------------------------------------------------------------------------------------------
    public queuePreloadResources ():void {
                
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // preload art
            //------------------------------------------------------------------------------------------
            {
                name: "DefaultBall",
                type: "ImageResource",
                path: "sprites/Preload/DefaultBall.svg"
            },
            {
                name: "ProgressBar",
                type: "ImageResource",
                path: "sprites/Preload/ProgressBar.png"
            },
        ], "Preload");
    }
}
