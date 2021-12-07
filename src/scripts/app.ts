//------------------------------------------------------------------------------------------
// app.ts
//------------------------------------------------------------------------------------------
import { G } from '../engine/app/G';
import { XApp } from '../engine/app/XApp';
import { ImageResource } from '../engine/resource/ImageResource';
import { StreamingResource } from '../engine/resource/StreamingResource';
import { MusicResource } from '../engine/resource/MusicResource';
import { SoundResource } from '../engine/resource/SoundResource';
import { SpriteSheetResource } from '../engine/resource/SpriteSheetResource';
import { BlobResource } from '../engine/resource/BlobResource';
import { XMapResource } from '../engine/resource/XMapResource';
import { ResourceSpec } from '../engine/resource/XResourceManager';
import { XWorld } from '../engine/sprite/XWorld';
import { XGameController } from '../engine/state/XGameController';
import { FpsMeter } from './fps-meter';
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
    public m_debugMessage:string;
    public m_intervalTimer:any;
    public fpsMeterItem:any;
    public m_delay:number;

//------------------------------------------------------------------------------------------
    constructor (__params:any) {
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
                fpsMax: 60,
                devicePixelRatio: window.devicePixelRatio,
            },

            __container
        );

        console.log (": starting: ");

        // return;
        
        world = new XWorld (g_XApp.stage, g_XApp, 8);
        world.setup ();

        world.setViewRect (G.CANVAS_WIDTH, G.CANVAS_HEIGHT);

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
    }
    
//------------------------------------------------------------------------------------------
    public setDebugMessage (__message:string):void {
        this.m_debugMessage = __message;
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
        // console.log (": render: ");

        if (g_XApp.renderer == null) {
            return;
        }
        
        requestAnimationFrame (this.render.bind (this));

        g_XApp.renderer.render (g_XApp.stage);

        fpsMeter.tick ();
    }

//------------------------------------------------------------------------------------------
    public configureAndLoadAssets ():void {
        g_XApp.getXProjectManager ().registerType ("SpriteSheet", SpriteSheetResource);
        g_XApp.getXProjectManager ().registerType ("ImageResource", ImageResource);
        g_XApp.getXProjectManager ().registerType ("SoundResource", SoundResource);
        g_XApp.getXProjectManager ().registerType ("StreamingResource", StreamingResource);
        g_XApp.getXProjectManager ().registerType ("MusicResource", MusicResource);
        g_XApp.getXProjectManager ().registerType ("BlobResource", BlobResource);
        g_XApp.getXProjectManager ().registerType ("XMapResource", XMapResource);

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
                this.queuePreloadResources ();;
                this.queueTestResources ();;

                g_XApp.getXProjectManager ().loadCowResources ();
            }
        );
    }

//------------------------------------------------------------------------------------------
    public queuePreloadResources ():void {
                        
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // preload art
            //------------------------------------------------------------------------------------------
            {
                name: "ProgressBar",
                type: "ImageResource",
                path: "sprites/Preload/ProgressBar.png"
            },
        ], "Preload");
    }

//------------------------------------------------------------------------------------------
    public queueTestResources ():void {
                            
        //------------------------------------------------------------------------------------------
        g_XApp.getXProjectManager ().queueResources ([

            //------------------------------------------------------------------------------------------
            // preload art
            //------------------------------------------------------------------------------------------
            {
                name: "bg",
                type: "ImageResource",
                path: "sprites/test/game-background-01.svg"
            },
        ], "Test");
    }

}
