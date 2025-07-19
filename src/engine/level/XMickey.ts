//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { XGameObjectCX} from '../gameobject/XGameObjectCX';
import { XLevel } from './XLevel';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class XMickey extends XGameObjectCX {
	private m_dead:boolean;
	private m_waitingSignal:XSignal;
	private m_playingSignal:XSignal;
	private m_ready:boolean;
	private m_invincible:number;
	private m_levelCompleteSignal:XSignal;
	private m_extraDX:number;
	private m_extraDY:number;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

		this.m_levelCompleteSignal = this.createXSignal ();
		this.m_waitingSignal = this.createXSignal ();
		this.m_playingSignal = this.createXSignal ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------	
	public get extraDX ():number {
		return this.m_extraDX;
	}
		
	public set extraDX (__val:number) {
		this.m_extraDX = __val;		
	}
		
//------------------------------------------------------------------------------------------	
	public get extraDY ():number {
		return this.m_extraDY;
	}
		
	public set extraDY (__val:number) {
		this.m_extraDY = __val;			
	}

//------------------------------------------------------------------------------------------
	public addLevelCompleteListener (__listener:any):number {
		return this.m_levelCompleteSignal.addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public removeLevelCompleteListener (__id:number):void {
		this.m_levelCompleteSignal.removeListener (__id);
	}
		
//------------------------------------------------------------------------------------------
	public fireLevelCompleteSignal ():void {
		this.m_levelCompleteSignal.fireSignal ();
	}
				
//------------------------------------------------------------------------------------------
	public isReady ():boolean {
		return this.m_ready;
	}

//------------------------------------------------------------------------------------------
	public addWaitingListener (__listener:any):number {
		return this.m_waitingSignal.addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public removeWaitingListener (__id:number):void {
		this.m_waitingSignal.removeListener (__id);
	}
		
//------------------------------------------------------------------------------------------
	public fireWaitingSignal ():void {
		this.m_waitingSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
	public addPlayingListener (__listener:any):number {
		return this.m_playingSignal.addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public removePlayingListener (__id:number):void {
		this.m_playingSignal.removeListener (__id);
	}
		
//------------------------------------------------------------------------------------------
	public firePlayingSignal ():void {
		this.m_playingSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
}