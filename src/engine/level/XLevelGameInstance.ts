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
import { XState } from '../state/XState';
import { XGameController } from '../state/XGameController';
import { XSoundManager } from '../sound/XSoundManager';
import { XSoundSubManager } from '../sound/XSoundSubManager';
import { G } from '../app/G';
import { XLevel } from '../level/XLevel';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XMickey } from "../level/XMickey";
import { XGameInstance } from '../state/XGameInstance';
import { XMickeyGameInstance } from './XMickeyGameInstance';
import { XMapItemModel } from '../xmap/XMapItemModel';
import { ZoneX } from '../zone/ZoneX';
import { ZoneManager } from '../zone/ZoneManager';

//------------------------------------------------------------------------------------------
export class XLevelGameInstance extends XMickeyGameInstance {
		public  m_levelObject:XLevel;
		public PLAYFIELD_LAYER:number = 0;
		public m_levelData:any;
		public m_levelProps:LevelPropsX;
		public m_levelName:String;
		public m_levelComplete:boolean;	
		public m_currentZone:number;
		public m_setMickeyToStartSignal:XSignal;
		public m_zoneStartedSignal:XSignal;
		public m_zoneFinishedSignal:XSignal;
		private m_zoneManager:ZoneManager;

    	// public var m_gameHudObject:_HudX;
		// public var m_hudObject:XLogicObject;
		// public var m_hudMessageObject:HudMessageX;

//------------------------------------------------------------------------------------------	
    constructor () {
        super ()
    }
    
//------------------------------------------------------------------------------------------
    public setup (__world:XWorld):void {
        super.setup (__world);

		this.m_setMickeyToStartSignal = new XSignal ();
		this.m_zoneStartedSignal = new XSignal ();
		this.m_zoneFinishedSignal = new XSignal ();
    }
    
//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();

        this.m_setMickeyToStartSignal.removeAllListeners ();
		this.m_zoneStartedSignal.removeAllListeners ();
		this.m_zoneFinishedSignal.removeAllListeners ();
    }
    
	//------------------------------------------------------------------------------------------
	public createZoneManager ():ZoneManager {
		return new ZoneManager ();
	}
		
	//------------------------------------------------------------------------------------------
	public getZoneManager ():ZoneManager {
		return this.m_zoneManager;
	}
		
	//------------------------------------------------------------------------------------------
	public getCurrentZone ():number {
		return this.m_currentZone;
		}

	//------------------------------------------------------------------------------------------
	public setCurrentZone (__zone:number):void {
		this.getZoneManager ().setCurrentZone (__zone);
	}
		
	//------------------------------------------------------------------------------------------
	public getAllGlobalItems ():void {
		this.getZoneManager ().getAllGlobalItems ();
	}
		
	//------------------------------------------------------------------------------------------
	public isValidZoneObjectItem (__itemName:string):boolean {
		return this.getZoneManager ().isValidZoneObjectItem (__itemName);
	}
		
	//------------------------------------------------------------------------------------------
	public isZoneObjectItemNoKill (__itemName:string):boolean {
		return this.getZoneManager ().isZoneObjectItemNoKill (__itemName);
		}
		
	//------------------------------------------------------------------------------------------
	public getZoneItems ():Map<number, XMapItemModel> /* <Int, XMapItemModel> */ {
		return this.getZoneManager ().getZoneItems ();
	}
		
	//------------------------------------------------------------------------------------------
	public getZoneItemObject (__zone:number):ZoneX {
		return this.getZoneManager ().getZoneItemObject (__zone);
	}
		
	//------------------------------------------------------------------------------------------
	public getStarterRingItems ():Map<number, XMapItemModel> /* <Int, XMapItemModel> */ {
		return this.getZoneManager ().getStarterRingItems ();
	}
		
	//------------------------------------------------------------------------------------------
	public setLevelObject (__levelObject:XLevel):void {
		this.m_levelObject = __levelObject;
	}
		
	//------------------------------------------------------------------------------------------
	public getLevelObject ():XLevel {
	    return this.m_levelObject;
	}

	//------------------------------------------------------------------------------------------
	public setMickeyToStartPosition (__zone:number):void {	
		this.getZoneManager ().setMickeyToStartPosition (__zone);
	}
		
	//------------------------------------------------------------------------------------------
	public setMickeyToLevelStartPosition ():void {
		this.getAllGlobalItems ();
			
        if (this.m_levelProps != null) {
			this.setCurrentZone (this.m_levelProps.getProperty ("zone"));
		} else {
			this.setCurrentZone (this.m_levelData.zone);		
		}
			
		this.m_levelObject.onEntry ();
			
		this.setMickeyToStartPosition (this.m_currentZone);
			
		this.m_mickeyObject.setXMapModel (this.m_mickeyObject.getLayer () + 1, this.world.getXMapModel (), this.m_levelObject);
	}
		
    //------------------------------------------------------------------------------------------
	public setLevelComplete (__complete:boolean):void {
		this.m_levelComplete = __complete;
	}
		
	//------------------------------------------------------------------------------------------
	public getLevelComplete ():boolean {
		return this.m_levelComplete;
	}

	//------------------------------------------------------------------------------------------
	public resetZoneKillCount ():void {
		this.getZoneManager ().resetZoneKillCount ();
	}
		
	//------------------------------------------------------------------------------------------
	public addToZoneKillCount ():void {
		this.getZoneManager ().addToZoneKillCount ();
	}
		
	//------------------------------------------------------------------------------------------
	public removeFromZoneKillCount ():void {
		this.getZoneManager ().removeFromZoneKillCount ();
	}
		
	//------------------------------------------------------------------------------------------
	public getZoneKillCount ():number {
		return this.getZoneManager ().getZoneKillCount ();
	}

	//------------------------------------------------------------------------------------------
	public addZoneStartedListener (__function:any):number {
		return this.m_zoneStartedSignal.addListener (__function);
	}
		
	//------------------------------------------------------------------------------------------
	public removeZoneStartedListener (__id:number):void {
		this.m_zoneStartedSignal.removeListener (__id);
	}
		
	//------------------------------------------------------------------------------------------
	public fireZoneStartedSignal ():void {
		this.m_zoneStartedSignal.fireSignal (this.getCurrentZone ());
	}
		
	//------------------------------------------------------------------------------------------
	public addZoneFinishedListener (__function:any):number {
		return this.m_zoneFinishedSignal.addListener (__function);
	}
		
	//------------------------------------------------------------------------------------------
	public removeZoneFinishedListener (__id:number):void {
		this.m_zoneFinishedSignal.removeListener (__id);
	}
		   
	 //------------------------------------------------------------------------------------------
	public fireZoneFinishedSignal ():void {
		this.m_zoneFinishedSignal.fireSignal (this.getCurrentZone ());
	}

//------------------------------------------------------------------------------------------
}