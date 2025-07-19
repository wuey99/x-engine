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

//------------------------------------------------------------------------------------------
export class XMickeyGameInstance extends XGameInstance {

	public m_mickeyObject:XMickey;
	// public m_mickeyCursorObject:MickeyCursorX;
	public m_mickeyDeathSignal:XSignal;

	private  m_lives:number;
	private  m_livesChangedSignal:XSignal;

//------------------------------------------------------------------------------------------	
    constructor () {
        super ()
    }
    
//------------------------------------------------------------------------------------------
    public setup (__world:XWorld):void {
        super.setup (__world);

		this.m_livesChangedSignal = new XSignal ();
        this.m_mickeyDeathSignal = new XSignal ();
    }
    
//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();

        this.m_livesChangedSignal.removeAllListeners ();
        this.m_mickeyDeathSignal.removeAllListeners ();
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
	public get lives ():number {
		return  this.m_lives;
	}
		
	public set lives (__val:number) {
		this.m_lives = __val;
			
		this.m_livesChangedSignal.fireSignal ();		
	}
		
	//------------------------------------------------------------------------------------------
	public addLivesChangedListener (__listener:any):number {
		return this.m_livesChangedSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removeLivesChangedListener (__id:number):void {
		this.m_livesChangedSignal.removeListener (__id);
	}
		
	//------------------------------------------------------------------------------------------
	public fireMickeyDeathSignal (__trigger:number):void {
		this.m_mickeyDeathSignal.fireSignal (__trigger);
	}
		
	//------------------------------------------------------------------------------------------
	public addMickeyDeathListener (__listener:number):number {
		return this.m_mickeyDeathSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removeMickeyDeathListener (__id:number):void {
		this.m_mickeyDeathSignal.removeListener (__id);
	}
		
	//------------------------------------------------------------------------------------------
	public addMickeyPlayingListener (__listener:any):number {
		return this.getMickeyObject ().addPlayingListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removeMickeyPlayingListener (__id:number):void {
		this.getMickeyObject ().removePlayingListener (__id);
	}

//------------------------------------------------------------------------------------------
}