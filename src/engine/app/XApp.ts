//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014-2021 Jimmy Huey (wuey99@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// <$end$/>
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { FederatedPointerEvent } from '@pixi/events';
import { XType } from '../type/XType';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XProcess} from '../process/XProcess';
import { XProcessManager} from '../process/XProcessManager';
import { XSignal } from '../signals/XSignal';
import { XSignalManager} from '../signals/XSignalManager';
import { XSprite } from '../sprite/XSprite';
import { XObjectPoolManager } from '../pool/XObjectPoolManager';
import { XClassPoolManager } from '../pool/XClassPoolManager';
import { XDepthSprite } from '../sprite/XDepthSprite';
import { XGameInstance } from '../state/XGameInstance';
import { XGameObject } from '../gameobject/XGameObject';
import { XProjectManager } from '../resource/XProjectManager';
import { XPoint } from '../geom/XPoint';
import { XRect } from '../geom/XRect';
import { G } from './G';
import { XPauseManager } from '../state/XPauseManager';
import { XSoundManager } from '../sound/XSoundManager';
import { Main } from '../../scripts/app';
import { Resource } from '../resource/Resource';
import { XTextureManager } from '../texture/XTextureManager';
import { XSubTextureManager } from '../texture/XSubTextureManager';
import { MovieClipMetadata } from '../texture/MovieClipMetaData';
import { XMapItemModel } from '../xmap/XMapItemModel';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSpriteLayer9 } from '../sprite/XSpriteLayer9';
import { XMapModel } from '../xmap/XMapModel';

//------------------------------------------------------------------------------------------
export interface XAppParams {
    containerId: string,
    canvasW: number,
    canvasH: number,
    fpsMax: number,
    devicePixelRatio:number
}

//------------------------------------------------------------------------------------------
export class XApp {
    public container: HTMLElement;
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public fpsMax: number;

	private m_XTaskManager0:XTaskManager;
	private m_XTaskManager:XTaskManager;
	private m_XProcessManager0:XProcessManager;
	private m_XProcessManager:XProcessManager;
    private m_XSignalManager:XSignalManager;
    
	private m_XClassPoolManager:XClassPoolManager;
	
	private m_XTextureManager:XTextureManager;
	private m_XSubTextureManager:XSubTextureManager;
    private m_XSignalPoolManager:XObjectPoolManager;
    private m_XRectPoolManager:XObjectPoolManager;
    private m_XPointPoolManager:XObjectPoolManager;
	private m_XTilemapPoolManager:XObjectPoolManager;
	private m_TilePoolManager:XObjectPoolManager;
	private m_XDepthSpritePoolManager:XObjectPoolManager;
	// private m_XBitmapDataAnimManager:XBitmapDataAnimManager;
    private m_XBitmapPoolManager:XObjectPoolManager;
    private m_XProjectManager:XProjectManager;
    private m_XSoundManager:XSoundManager;
    private m_XMapItemModelPoolManager:XObjectPoolManager;

    private m_frameRateScale:number;
	private m_currentTimer:number;
    private m_previousTimer:number;
    private m_inuse_TIMER_FRAME:number;

    private m_mousePoint:XPoint;
    private m_touchPoint:XPoint;

    private m_canvasWidth:number;
    private m_canvasHeight:number;
    private m_screenWidth:number;
    private m_screenHeight:number;
    private m_scaleXRatio:number;
    private m_scaleYRatio:number;

    private m_scaleRatio:number;
    private m_xoffset:number;
    private m_yoffset:number;

    private m_paused:boolean;

    private m_resizeTrigger:boolean;
    private m_windowResizeSignal:XSignal;

    private m_hasFocus:boolean;

    private m_main:Main;

    private m_pointerDownHandle:any;
    private m_pointerMoveHandle:any;
    private m_touchMoveHandle:any;
    private m_visibilityChangedHandle:any;
    private m_resizerHandle:any;

    private m_firstClick:boolean;

    public static DISABLE_PAUSE:boolean = false;
    public static FULL_SCREEN:boolean = false;

    //------------------------------------------------------------------------------------------
    constructor (__main:Main, params: XAppParams, __container:HTMLElement = null) {
        this.renderer = PIXI.autoDetectRenderer ({
            backgroundAlpha: 0.0,
            width: this.getWindowWidth (), // params.canvasW,
            height: this.getWindowHeight (), // params.canvasH,
            antialias: true
        }) as PIXI.Renderer;

        this.m_main = __main;
        this.stage = new PIXI.Container ();
        this.fpsMax = params.fpsMax;

        this.stage.interactive = true;
        this.stage.interactiveChildren = true;

        switch (Math.round (params.devicePixelRatio)) {
            case 1:
                G.scaleRatio = 1; // 2;
                break;
            case 2:
                G.scaleRatio = 1;
                break;
            case 3:
                G.scaleRatio = 1;
                break;
            case 4:
                G.scaleRatio = 1;
                break;
            default:
                G.scaleRatio = 1;
                break;
        }

        console.log (": -------------------------->: window.devicePixelRatio: ", Math.round (params.devicePixelRatio));
        
        if (__container != null) {
            this.container = __container;
        } else {
            this.container = params.containerId ? document.getElementById(params.containerId) || document.body : document.body;
        }
        this.container.appendChild (this.renderer.view as any);

		XGameObject.setXApp (this);
		XTask.setXApp (this);
        XProcess.setXApp (this)
		// TODO XTilemap.setXApp (this);
		XSprite.setXApp (this);
        XMapModel.setXApp (this);
		// TODO XTextureManager.setXApp (this);
		// TODO XTileSubTextureManager.setXApp (this);
        // TODO XSubTextureManager.setXApp (this);
        XGameInstance.setXApp (this);
        MovieClipMetadata.setXApp (this);

        G.XApp = this;
        
        this.__initPoolManagers (this.getDefaultPoolSettings ());

        this.m_XTaskManager0 = new XTaskManager (this);	
		this.m_XTaskManager = new XTaskManager (this);	
        this.m_XProcessManager0 = new XProcessManager (this);	
		this.m_XProcessManager = new XProcessManager (this);	
        this.m_XSignalManager = new XSignalManager (this);
        this.m_XProjectManager = new XProjectManager (this);
        this.m_XSoundManager = new XSoundManager (this);
        this.m_XTextureManager = new XTextureManager (this);
        this.m_XClassPoolManager = new XClassPoolManager ();

        this.m_frameRateScale = 1.0;
		this.m_previousTimer = XType.getNowDate ().getTime ();
        this.m_currentTimer = 0.0;
        this.m_inuse_TIMER_FRAME = 0;
        
        this.m_mousePoint = new XPoint ();
        this.m_touchPoint = new XPoint ();
        
        this.m_paused = false;

        this.setupResizer ();

        this.m_firstClick = false;

        this.getStage ().on ("pointerup", this.m_pointerDownHandle = (e:FederatedPointerEvent) => {
            this.m_firstClick = true;
        });

        this.getStage ().on ("pointermove", this.m_pointerMoveHandle = (e:FederatedPointerEvent) => {
            var __mousePos:PIXI.Point = this.getStage ().toLocal (e.global);

            this.m_mousePoint.x = __mousePos.x;
            this.m_mousePoint.y = __mousePos.y;
    
            console.log (": XApp: pointermove: ", this.m_mousePoint);

            // this.m_main.setDebugMessage ("" + __mousePos.x + ", " + __mousePos.y);
        });

        this.getStage ().on ("touchmove", this.m_touchMoveHandle = (e:FederatedPointerEvent) => {
            var __mousePos:PIXI.Point = this.getStage ().toLocal (e.global);

            this.m_touchPoint.x = __mousePos.x;
            this.m_touchPoint.y = __mousePos.y;

            // this.m_main.setDebugMessage ("" + __mousePos.x + ", " + __mousePos.y);
        });

        this.m_hasFocus = true;

        if (!XApp.DISABLE_PAUSE) {
            document.addEventListener ("visibilitychange", this.m_visibilityChangedHandle = () => {
                this.m_hasFocus = document.visibilityState === "visible";
                
                if (this.m_hasFocus) {
                    if (!this.m_paused) {
                        XPauseManager.fireResumeSignal ();
                    }
                } else {
                    if (!this.m_paused) {
                        XPauseManager.firePauseSignal ();
                    }
                }
            });
        }
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        this.m_XTaskManager0.removeAllTasks ();
        this.m_XTaskManager.removeAllTasks ();
        this.m_XProcessManager0.removeAllProcesses ();
        this.m_XProcessManager.removeAllProcesses ();
        this.m_XSignalManager.removeAllXSignals ();
        
        this.getStage ().off ("pointerdown", this.m_pointerDownHandle);
        this.getStage ().off ("pointermove", this.m_pointerMoveHandle);
        this.getStage ().off ("touchmove", this.m_touchMoveHandle);
        document.removeEventListener ("visibilitychange", this.m_visibilityChangedHandle);
        window.removeEventListener ("resize", this.m_resizerHandle);

        this.getTextureManager ().cleanup ();
        
        console.log (": XProjectManager.cleanup (): ");

        this.m_XProjectManager.cleanup ();
        XPauseManager.cleanup ();

        this.container.removeChild (this.renderer.view as any);
  
        console.log (": render: destroy: ");
        
        this.renderer.destroy ();
        this.renderer = null;
    }

//------------------------------------------------------------------------------------------
    public getMaximalPoolSettings ():any {
        return {
            XSignal: {init: 10000, overflow: 1000},
            XTilemap: {init: 4000, overflow: 1000},
            XBitmap: {init: 4000, overflow: 1000},
            Tile: {init: 4000, overflow: 1000},
            XDepthSprite: {init: 4000, overflow: 1000},
            XMapItemModel: {init: 12288, overflow: 2048}
        };
    }

//------------------------------------------------------------------------------------------
    public getDefaultPoolSettings ():any {
        return {
            XSignal: {init: 2000, overflow: 1000},
            XRect: {init: 2000, overflow: 1000},				
            XPoint: {init: 2000, overflow: 1000},
            XTilemap: {init: 4000, overflow: 1000},
            XBitmap: {init: 4000, overflow: 1000},
            Tile: {init: 4000, overflow: 1000},
            XDepthSprite: {init: 2000, overflow: 1000},
            XMapItemModel: {init: 12288, overflow: 2048}
        };
    }

//------------------------------------------------------------------------------------------
    private __initPoolManagers (__poolSettings:any):void {

//------------------------------------------------------------------------------------------
// XSignals
//------------------------------------------------------------------------------------------
        this.m_XSignalPoolManager = new XObjectPoolManager (
            ():any => {
                return new XSignal ();
            },
            
            (__src:any, __dst:any):any => {
                return null;
            },
            
            __poolSettings.XSignal.init, __poolSettings.XSignal.overflow
        );
        
//------------------------------------------------------------------------------------------
// XRect
//------------------------------------------------------------------------------------------
        this.m_XRectPoolManager = new XObjectPoolManager (
            ():any => {
                return new XRect ();
            },
            
            (__src:any, __dst:any):any => {
                var __rect1:XRect = __src as XRect;
                var __rect2:XRect = __dst as XRect;
                
                __rect2.x = __rect1.x;
                __rect2.y = __rect1.y;
                __rect2.width = __rect1.width;
                __rect2.height = __rect1.height;
                
                return __rect2;
            },
            
            __poolSettings.XRect.init, __poolSettings.XRect.overflow
        );

//------------------------------------------------------------------------------------------
// XPoint
//------------------------------------------------------------------------------------------
        this.m_XPointPoolManager = new XObjectPoolManager (
            ():any => {
                return new XPoint ();
            },
            
            (__src:any, __dst:any):any => {
                var __point1:XPoint = __src as XPoint;
                var __point2:XPoint = __dst as XPoint;
                
                __point2.x = __point1.x;
                __point2.y = __point1.y;

                return __point2;
            },
            
            __poolSettings.XPoint.init, __poolSettings.XPoint.overflow
        );

//------------------------------------------------------------------------------------------
// XTilemap
//------------------------------------------------------------------------------------------
    /* TODO
    m_XTilemapPoolManager = new XObjectPoolManager (
        function ():Dynamic {
            var __bitmap:XTilemap = new XTilemap ();
            
            return __bitmap;
        },
        
        function (__src:Dynamic, __dst:Dynamic):Dynamic {
            return null;
        },
        
        __poolSettings.XTilemap.init, __poolSettings.XTilemap.overflow
    );
    */

//------------------------------------------------------------------------------------------
// XBitmap
//------------------------------------------------------------------------------------------
    /* TODO
    m_XBitmapPoolManager = new XObjectPoolManager (
        function ():Dynamic {
            var __bitmap:XBitmap = new XBitmap ();

            return __bitmap;
        },
        
        function (__src:Dynamic, __dst:Dynamic):Dynamic {
            return null;
        },
        
        __poolSettings.XBitmap.init, __poolSettings.XBitmap.overflow
    );
    */

//------------------------------------------------------------------------------------------
// Tile
//------------------------------------------------------------------------------------------
    /* TODO
    m_TilePoolManager = new XObjectPoolManager (
        function ():Dynamic{
            var __tile:Tile = new Tile (0, 0, 0, 1.0, 1.0, 0.0);
            
            return __tile;
        },
        
        function (__src:Dynamic, __dst:Dynamic):Dynamic {
            return null;
        },
        
        __poolSettings.Tile.init, __poolSettings.Tile.overflow
    );
    */

//------------------------------------------------------------------------------------------
// XDepthSprite
//------------------------------------------------------------------------------------------
        this.m_XDepthSpritePoolManager = new XObjectPoolManager (
            ():any => {
                var __sprite:XDepthSprite = new XDepthSprite ();
                
                __sprite.clear ();
                
                return __sprite;
            },
            
            (__src:any, __dst:any):any => {
                return null;
            },
            
            __poolSettings.XDepthSprite.init, __poolSettings.XDepthSprite.overflow
        );

//------------------------------------------------------------------------------------------
// XMapItemModel
//------------------------------------------------------------------------------------------
        this.m_XMapItemModelPoolManager = new XObjectPoolManager (
           ():any => {
                var __xmapItem:XMapItemModel = new XMapItemModel ();
                
                return __xmapItem;
            },
            
            (__src:any, __dst:any):any => {
                return null;
            },
            
            __poolSettings.XMapItemModel.init, __poolSettings.XMapItemModel.overflow
        );
    }

//------------------------------------------------------------------------------------------
    public gotFirstClick ():boolean {
        return this.m_firstClick;
    }

//------------------------------------------------------------------------------------------
    public hasFocus ():boolean {
        return this.m_hasFocus;
    }

//------------------------------------------------------------------------------------------
    public pause ():void {
        if (XApp.DISABLE_PAUSE) {
            return;
        }

        if (!this.m_paused) {
            XPauseManager.firePauseSignal ();

            this.m_paused = true;
        }
    }

//------------------------------------------------------------------------------------------
    public resume ():void {
        if (XApp.DISABLE_PAUSE) {
            return;
        }

        if (this.m_paused) {
            XPauseManager.fireResumeSignal ();

            this.m_paused = false;
        }
    }

//------------------------------------------------------------------------------------------
    public isPaused ():boolean {
        return this.m_paused;
    }

//------------------------------------------------------------------------------------------
    public muteMusic (__mute:boolean):void {
        XPauseManager.fireMuteMusicSignal (__mute);
    }

//------------------------------------------------------------------------------------------
    public muteSFX (__mute:boolean):void {
        XPauseManager.fireMuteSFXSignal (__mute)
    }

//------------------------------------------------------------------------------------------
	public update ():void {
		if (this.m_inuse_TIMER_FRAME > 0) {
			console.log (": overflow: TIMER_FRAME: ");
				
			return;
		}
        
		this.m_inuse_TIMER_FRAME++;
		
		var __deltaTime:number = XType.getNowDate ().getTime () - this.m_previousTimer;
		
        this.getXTaskManager0 ().updateTasks ();
        this.getXProcessManager0 ().updateProcesses ();

        if (!this.m_paused) {
            // console.log (": XApp: update: ");

			this.getXTaskManager ().updateTasks ();
			this.getXProcessManager ().updateProcesses ();

			// this.m_currentTimer += __deltaTime;

            this.m_currentTimer += 1000.0 / this.fpsMax;
		}
		
		this.m_previousTimer = XType.getNowDate ().getTime ();
		
		this.m_inuse_TIMER_FRAME--;
    }

//------------------------------------------------------------------------------------------
    public setupResizer ():void {
        this.m_resizeTrigger = false;

        this.m_windowResizeSignal = this.m_XSignalManager.createXSignal ();

        window.addEventListener ("resize", this.m_resizerHandle = () => {
            this.m_resizeTrigger = true;
        });

        this.getXTaskManager ().addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0800,

                XTask.FLAGS, (__task:XTask) => {
                    __task.ifTrue (this.m_resizeTrigger);
                }, XTask.BNE, "loop",

                () => {
                    this.resize ();

                    this.m_resizeTrigger = false;
                },

                XTask.GOTO, "loop",
            XTask.RETN,
        ]);
        
        this.resize ();
    }

//------------------------------------------------------------------------------------------
    public resize ():void {
        // console.log (": XApp: resize: ", this.getWindowWidth (), this.getWindowHeight ());

        this.getRenderer ().resize (window.innerWidth, window.innerHeight);

        // this.getRenderer ().resize (this.getWindowWidth (), this.getWindowHeight ());

        this.setupSize (
            this.getWindowWidth (), this.getWindowHeight (),
            G.SCREEN_WIDTH, G.SCREEN_HEIGHT
        );

        this.fitScreenToCanvas ();;

        this.m_windowResizeSignal.fireSignal ();
    }

//------------------------------------------------------------------------------------------
    public addWindowResizeListener (__listener:any):number {
        return this.m_windowResizeSignal.addListener (__listener);
    }

//------------------------------------------------------------------------------------------
    public removeWindowResizeListener (__id:number):void {
        this.m_windowResizeSignal.removeListener (__id);
    }

    //------------------------------------------------------------------------------------------
    public getWindowWidth ():number {
        if (XApp.FULL_SCREEN) {
            return window.innerWidth;
        }

        var __gameElement:HTMLElement = document.getElementById ("game");
        var __rect:DOMRect = __gameElement.getBoundingClientRect ();

        // console.log (": domRect: ", __rect, window.innerWidth, window.innerHeight);

        return Math.min (__rect.width, window.innerWidth - __rect.x);
    }

    //------------------------------------------------------------------------------------------
    public getWindowHeight ():number {
        if (XApp.FULL_SCREEN) {
            return window.innerHeight;
        }

        var __gameElement:HTMLElement = document.getElementById ("game");
        var __rect:DOMRect = __gameElement.getBoundingClientRect ();

        return Math.min (__rect.height, window.innerHeight - __rect.y) - 0;
    }

    //------------------------------------------------------------------------------------------
    public setupSize (__canvasWidth:number, __canvasHeight:number, __screenWidth:number, __screenHeight:number):void {
        G.CANVAS_WIDTH = __canvasWidth;
        G.CANVAS_HEIGHT = __canvasHeight;

        this.m_canvasWidth = __canvasWidth;
        this.m_canvasHeight = __canvasHeight;

        this.m_screenWidth = __screenWidth;
        this.m_screenHeight = __screenHeight;

        this.m_scaleXRatio = this.m_screenWidth / this.m_canvasWidth;
        this.m_scaleYRatio = this.m_screenHeight / this.m_canvasHeight;
    }

    //------------------------------------------------------------------------------------------
    public getCanvasWidth ():number {
        return this.m_canvasWidth;
    }

    //------------------------------------------------------------------------------------------
    public getCanvasHeight ():number {
        return this.m_canvasHeight;
    }

    //------------------------------------------------------------------------------------------
    public getScreenWidth ():number {
        return this.m_screenWidth;
    }

    //------------------------------------------------------------------------------------------
    public getScreenHeight ():number {
        return this.m_screenHeight;
    }

    //------------------------------------------------------------------------------------------
	public fitScreenToCanvas ():void {
		var __scaleX:number = this.getCanvasWidth () / this.getScreenWidth ();
		var __scaleY:number = this.getCanvasHeight () / this.getScreenHeight ();
			
		this.m_scaleRatio = Math.min (__scaleX, __scaleY);
			
		this.m_xoffset = (this.getCanvasWidth () - this.getScreenWidth () * this.m_scaleRatio) / 2;
		this.m_yoffset = (this.getCanvasHeight () - this.getScreenHeight () * this.m_scaleRatio) / 2;
	}
		
    //------------------------------------------------------------------------------------------
	public getXOffset ():number {
		return this.m_xoffset;
	}
		
    //------------------------------------------------------------------------------------------
	public getYOffset ():number {
		return this.m_yoffset;
	}
		
    //------------------------------------------------------------------------------------------
	public getScaleRatio ():number {
		return this.m_scaleRatio;
	}

    //------------------------------------------------------------------------------------------
    public getRenderer ():PIXI.Renderer {
        return this.renderer;
    }

    //------------------------------------------------------------------------------------------
    public getMain ():Main {
        return this.m_main;
    }

    //------------------------------------------------------------------------------------------
    public getStage ():PIXI.Container {
        return this.stage;
    }

    //------------------------------------------------------------------------------------------
    public getMousePos ():XPoint {
        return this.m_mousePoint;
    }

    //------------------------------------------------------------------------------------------
    public getTouchPos ():XPoint {
        return this.m_touchPoint;
    }

    //------------------------------------------------------------------------------------------
    public setFrameRateScale (__scale:number):void {
        this.m_frameRateScale = __scale;
    }

    //------------------------------------------------------------------------------------------
    public getFrameRateScale ():number {
        return this.m_frameRateScale;
    }

    //------------------------------------------------------------------------------------------
	public getTime ():number {
		return this.m_currentTimer;
    }

    //------------------------------------------------------------------------------------------
    public getXTaskManager0 ():XTaskManager {
        return this.m_XTaskManager0;
    }

    //------------------------------------------------------------------------------------------
    public getXTaskManager ():XTaskManager {
        return this.m_XTaskManager;
    }

    //------------------------------------------------------------------------------------------
    public getXProcessManager0 ():XProcessManager {
        return this.m_XProcessManager0;
    }

    //------------------------------------------------------------------------------------------
    public getXProcessManager ():XProcessManager {
        return this.m_XProcessManager;
    }

    //------------------------------------------------------------------------------------------
    public createXSignal ():XSignal {
        return this.m_XSignalManager.createXSignal ();
    }
        
    //------------------------------------------------------------------------------------------
    public getXSignalManager ():XSignalManager {
        return this.m_XSignalManager;
    }

    //------------------------------------------------------------------------------------------
    public getXRectPoolManager ():XObjectPoolManager {
        return this.m_XRectPoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getXPointPoolManager ():XObjectPoolManager {
        return this.m_XPointPoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getXDepthSpritePoolManager ():XObjectPoolManager {
        return this.m_XDepthSpritePoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getXMapItemModelPoolManager ():XObjectPoolManager {
        return this.m_XMapItemModelPoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getXProjectManager ():XProjectManager {
        return this.m_XProjectManager;
    }

    //------------------------------------------------------------------------------------------
    public getClassPoolManager ():XClassPoolManager {
        return this.m_XClassPoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getXSoundManager ():XSoundManager {
        return this.m_XSoundManager;
    }

    //------------------------------------------------------------------------------------------
    public getTextureManager ():XTextureManager {
        return this.m_XTextureManager;
    }

    //------------------------------------------------------------------------------------------
    public getDefaultSubTextureManager ():XSubTextureManager {
        return this.m_XTextureManager.getSubManager ("__global__");
    }

    //------------------------------------------------------------------------------------------
    public getSubTextureManager (__name:string):XSubTextureManager {
        return this.m_XTextureManager.getSubManager (__name);
    }
    
    //------------------------------------------------------------------------------------------
    public getResourceHandleByName (__name:string):Resource {
        return this.m_XProjectManager.getResourceHandleByName (__name);
    }

    //------------------------------------------------------------------------------------------
    public getClass (__name:string):any {
        return this.m_XProjectManager.getResourceByName (__name);
    }

    //------------------------------------------------------------------------------------------
    public getResourceByName (__name:string):any {
        return this.m_XProjectManager.getResourceByName (__name);
    }

    //------------------------------------------------------------------------------------------
    public unloadClass (__name:string):void {
        this.m_XProjectManager.unloadClass (__name);
    }

    //------------------------------------------------------------------------------------------
    public unload (__name:string):void {
        this.m_XProjectManager.unload (__name);
    }

//------------------------------------------------------------------------------------------
}