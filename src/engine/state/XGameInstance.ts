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
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { XState } from './XState';
import { XGameController } from './XGameController';
import { XSoundManager } from '../sound/XSoundManager';
import { XSoundSubManager } from '../sound/XSoundSubManager';
import { G } from '../app/G';
import { XLevel } from '../level/XLevel';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XMickey } from "../level/XMickey";

//------------------------------------------------------------------------------------------
export class XGameInstance {
    public m_states:Map<string, any>;
    public m_gameStateObject:XState;
	public m_controller:XGameController;

    public world:XWorld;

    public static g_XApp:XApp;

	public m_triggerSignal:XSignal;
	public m_triggerXSignal:XSignal;
	public m_pingSignal:XSignal;

	public m_logicClassNameToClass:Map<string, any>;

	public m_mickeyObject:XMickey;

//------------------------------------------------------------------------------------------	
	constructor () {
        this.m_states = new Map<string, any> ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld):void {
		this.world = __world;

		this.m_triggerSignal = new XSignal ();
		this.m_triggerXSignal = new XSignal ();
		this.m_pingSignal = new XSignal ();

		this.m_logicClassNameToClass = new Map<string, any> ();
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		this.m_triggerSignal.removeAllListeners ();
		this.m_triggerXSignal.removeAllListeners ();
		this.m_pingSignal.removeAllListeners ();
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
	public getMaskAlpha ():number {
		return 1.0;
		
		// return 1.0 - m_mask.alpha;
	}
		
	//------------------------------------------------------------------------------------------
	public setMaskAlpha (__alpha:number):void {
		// m_mask.alpha = 1.0 - Math.min (1.0, __alpha);
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
	public initLogicClassNames (__array:Array<any>):void {
		this.m_logicClassNameToClass = XType.array2XDict (__array);	
	}
		
	//------------------------------------------------------------------------------------------
	public logicClassNameToClass (__logicClassName:string):any {
		return this.m_logicClassNameToClass.get (__logicClassName.replace ("$", "__"));
	}

	//------------------------------------------------------------------------------------------
	public setMickeyObject (__mickeyObject:XMickey):void {
		this.m_mickeyObject = __mickeyObject;
	}

	//------------------------------------------------------------------------------------------
	public getMickeyObject ():XMickey {
		return this.m_mickeyObject;
	}

	//------------------------------------------------------------------------------------------
	public getGameStateObject ():XState {
		return this.m_gameStateObject;
	} 

	//------------------------------------------------------------------------------------------
	public setController (__controller:XGameController):void {
		this.m_controller = __controller;
	}

	//------------------------------------------------------------------------------------------
	public getController ():XGameController {
		return this.m_controller;
	}

	//------------------------------------------------------------------------------------------
	public gotoState (__name:string, __params:Array<any> = null, __layer:number = 0, __depth:number = 0.0):XGameObject {
		if (this.m_states.has (__name)) {
			var __class:any = this.m_states.get (__name);
				
			if (this.m_gameStateObject != null) {
				this.m_gameStateObject.nuke ();

				this.m_gameStateObject = null;
			}
				
			this.getXApp ().getXTaskManager ().addTask ([
				XTask.WAIT, 0x0100,
					
				() => {
					this.m_gameStateObject = this.world.addGameObject (__class, __layer, __depth) as XState;
					this.m_gameStateObject.setGameInstance (this);
                    this.m_gameStateObject.afterSetup (__params);

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
	public fireTriggerSignal (__trigger:number):void {
		this.m_triggerSignal.fireSignal (__trigger);
	}
		
	//------------------------------------------------------------------------------------------
	public addTriggerListener (__listener:any):number {
		return this.m_triggerSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removeTriggerListener (__id:number):void {
		this.m_triggerSignal.removeListener (__id);
	}
		
	//------------------------------------------------------------------------------------------
	public fireTriggerXSignal (__trigger:String):void {
		this.m_triggerXSignal.fireSignal (__trigger);
	}
		
	//------------------------------------------------------------------------------------------
	public addTriggerXListener (__listener:any):number {
		return this.m_triggerXSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removeTriggerXListener (__id:number):void {
		this.m_triggerXSignal.removeListener (__id);
	}
		
	//------------------------------------------------------------------------------------------
	public addPingListener (__listener:any):number {
		return this.m_pingSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removePingListener (__id:number):void {
		this.m_pingSignal.removeListener (__id);
	}

	//------------------------------------------------------------------------------------------
	public firePingSignal (
		__id:number,
		__type:String,
		__logicObject:XGameObject,
		__listener:any
	):void {
		this.m_pingSignal.fireSignal (__id, __type, __logicObject, __listener);
	}

//------------------------------------------------------------------------------------------
}