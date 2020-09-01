//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/Xtype';
import { GameObject} from '../gameobject/GameObject';
import { XState } from './XState';

//------------------------------------------------------------------------------------------
export class XGameInstance {
    
    public m_states:Map<string, any>;
    public m_gameStateObject:XState;

    public world:XWorld;

    public static g_XApp:XApp;

//------------------------------------------------------------------------------------------	
	constructor () {
        this.m_states = new Map<string, any> ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld):void {
        this.world = __world;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
	}
    
	//------------------------------------------------------------------------------------------
	public static setXApp (__XApp:XApp):void {
		XGameInstance.g_XApp = __XApp;
	}
		
	//------------------------------------------------------------------------------------------
	public getXApp ():XApp {
		return XGameInstance.g_XApp;
	}
            
	//------------------------------------------------------------------------------------------
	public registerState (__name:string, __class:any):void {
		if (!this.m_states.has (__name)) {
			this.m_states.set (__name, __class);
		}
	}
		
	//------------------------------------------------------------------------------------------
	public unregisterState (__name:string):void {
		if (this.m_states.has (__name)) {
			this.m_states.delete (__name);
		}
	}
		
	//------------------------------------------------------------------------------------------
	public gotoState (__name:string, __params:Array<any> = null, __layer:number = 0, __depth:number = 0.0):GameObject {
		if (this.m_states.has (__name)) {
			var __class:any = this.m_states.get (__name);
				
			if (this.m_gameStateObject != null) {
				this.m_gameStateObject.nuke ();
			}
				
			this.getXApp ().getXTaskManager ().addTask ([
				XTask.WAIT, 0x0100,
					
				() => {
					this.m_gameStateObject = this.world.addGameObject (__class, __layer, __depth) as XState;
                    this.m_gameStateObject.afterSetup (__params);

					this.m_gameStateObject.setGameInstance (this);

					this.m_gameStateObject.addKillListener (() => {
						this.m_gameStateObject = null;
                    });
				},
					
				XTask.RETN,
			]);
				
			return this.m_gameStateObject;
		}
			
		return null;
    }
        
//------------------------------------------------------------------------------------------
}