//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XType } from '../type/Xtype';
import { XTaskManager} from '../task/XTaskManager';
import { XSignal } from '../signals/XSignal';
import { XSignalManager} from '../signals/XSignalManager';

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

		this.m_XTaskManager = new XTaskManager (this);	
        this.m_XSignalManager = new XSignalManager (this);
        
        this.m_frameRateScale = 1.0;
		this.m_previousTimer = XType.getNowDate ().getTime ();
        this.m_currentTimer = 0.0;
		this.m_inuse_TIMER_FRAME = 0;
    }

//------------------------------------------------------------------------------------------
	public update ():void {
		if (this.m_inuse_TIMER_FRAME > 0) {
			console.log (": overflow: TIMER_FRAME: ");
				
			return;
		}
		
		this.m_inuse_TIMER_FRAME++;
		
		var __deltaTime:number = XType.getNowDate ().getTime () - this.m_previousTimer;
		
        {
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
}