//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XType } from '../type/XType';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XSignal } from '../signals/XSignal';
import { XSignalManager} from '../signals/XSignalManager';
import { XSprite } from '../sprite/XSprite';
import { XObjectPoolManager } from '../pool/XObjectPoolManager';
import { XClassPoolManager } from '../pool/XClassPoolManager';
import { XDepthSprite } from '../sprite/XDepthSprite';
import { XGameInstance } from '../state/XGameInstance';
import { XGameObject } from '../gameobject/XGameObject';

//------------------------------------------------------------------------------------------
export interface XAppParams {
    containerId: string,
    canvasW: number,
    canvasH: number,
    fpsMax: number
}

//------------------------------------------------------------------------------------------
export class XApp {
  
    public container: HTMLElement;
    public loader: PIXI.Loader;
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public graphics: PIXI.Graphics;
    public fpsMax: number;

	private m_XTaskManager:XTaskManager;
    private m_XSignalManager:XSignalManager;
    
	private m_XClassPoolManager:XClassPoolManager;
	
	// private m_XTextureManager:XTextureManager;
	// private m_XSubTextureManager:XSubTextureManager;
	private m_XSignalPoolManager:XObjectPoolManager;
	private m_XTilemapPoolManager:XObjectPoolManager;
	private m_TilePoolManager:XObjectPoolManager;
	private m_XDepthSpritePoolManager:XObjectPoolManager;
	// private m_XBitmapDataAnimManager:XBitmapDataAnimManager;
    private m_XBitmapPoolManager:XObjectPoolManager;
    
    private m_frameRateScale:number;
	private m_currentTimer:number;
    private m_previousTimer:number;
    private m_inuse_TIMER_FRAME:number;
    
    //------------------------------------------------------------------------------------------
    constructor (params: XAppParams) {
        this.loader = PIXI.Loader.shared;
        this.renderer = PIXI.autoDetectRenderer ({
            width: params.canvasW,
            height: params.canvasH,
            antialias: true
        });
        this.stage = new PIXI.Container ();
        this.graphics = new PIXI.Graphics ();
        this.fpsMax = params.fpsMax;

        this.container = params.containerId ? document.getElementById(params.containerId) || document.body : document.body;
        this.container.appendChild(this.renderer.view)

		XGameObject.setXApp(this);
		XTask.setXApp (this);
		// TODO XTilemap.setXApp (this);
		XSprite.setXApp (this);
		// TODO XTextureManager.setXApp (this);
		// TODO XTileSubTextureManager.setXApp (this);
        // TODO XSubTextureManager.setXApp (this);
        XGameInstance.setXApp (this);

        this.__initPoolManagers (this.getDefaultPoolSettings ());

		this.m_XTaskManager = new XTaskManager (this);	
        this.m_XSignalManager = new XSignalManager (this);
        
        this.m_frameRateScale = 1.0;
		this.m_previousTimer = XType.getNowDate ().getTime ();
        this.m_currentTimer = 0.0;
		this.m_inuse_TIMER_FRAME = 0;
    }

//------------------------------------------------------------------------------------------
    public getMaximalPoolSettings ():any {
        return {
            XSignal: {init: 10000, overflow: 1000},
            XTilemap: {init: 4000, overflow: 1000},
            XBitmap: {init: 4000, overflow: 1000},
            Tile: {init: 4000, overflow: 1000},
            XDepthSprite: {init: 4000, overflow: 1000},
        };
    }

//------------------------------------------------------------------------------------------
    public getDefaultPoolSettings ():any {
        return {
            XSignal: {init: 2000, overflow: 1000},
            XTilemap: {init: 4000, overflow: 1000},
            XBitmap: {init: 4000, overflow: 1000},
            Tile: {init: 4000, overflow: 1000},
            XDepthSprite: {init: 2000, overflow: 1000},
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
    }

//------------------------------------------------------------------------------------------
	public update ():void {
        /*
		if (this.m_inuse_TIMER_FRAME > 0) {
			console.log (": overflow: TIMER_FRAME: ");
				
			return;
		}
        */
        
		this.m_inuse_TIMER_FRAME++;
		
		var __deltaTime:number = XType.getNowDate ().getTime () - this.m_previousTimer;
		
        {
            console.log (": XApp: update: ");

			this.getXTaskManager ().updateTasks ();
			
			this.m_currentTimer += __deltaTime;
		}
		
		this.m_previousTimer = XType.getNowDate ().getTime ();
		
		this.m_inuse_TIMER_FRAME--;
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
    public getXTaskManager ():XTaskManager {
        return this.m_XTaskManager;
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
    public getXDepthSpritePoolManager ():XObjectPoolManager {
        return this.m_XDepthSpritePoolManager;
    }

//------------------------------------------------------------------------------------------
}