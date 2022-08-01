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
import * as PIXI from 'pixi.js-legacy'
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
import { XGameInstance } from './XGameInstance';
import { G } from '../app/G';
import { XLevel } from '../level/XLevel';

//------------------------------------------------------------------------------------------
export class XState extends XGameObject {
    public m_gameInstance:XGameInstance;
	public m_resizeListenerID:number;
    public m_levelObject:XLevel;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);

		this.m_resizeListenerID = this.m_XApp.addWindowResizeListener (this.resize.bind (this));
		this.resize ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();

		this.m_XApp.removeWindowResizeListener (this.m_resizeListenerID);

		this.world.getStreamingSoundManager ().removeAllSounds ();
		this.world.getMusicSoundManager ().removeAllSounds ();
		this.world.getSFXSoundManager ().removeAllSounds ();
	}

//------------------------------------------------------------------------------------------
	public resize ():void {
		this.m_XApp.getRenderer ().resize (this.m_XApp.getWindowWidth (), this.m_XApp.getWindowHeight ());

		//------------------------------------------------------------------------------------------
		// scale the entire stage
		//------------------------------------------------------------------------------------------		
		this.m_XApp.getStage ().scale.x = 1.0;
		this.m_XApp.getStage ().scale.y = 1.0;

		var i:number;

		for (i=0; i < this.world.MAX_LAYERS; i++) {
			var __x:number = 0;
			var __y:number = 0;

			var __screenWidth:number = this.m_XApp.getScreenWidth ();
			var __screenHeight:number = this.m_XApp.getScreenHeight ();

			var __scaleX:number = this.m_XApp.getCanvasWidth () / __screenWidth;
			var __scaleY:number = this.m_XApp.getCanvasHeight () / __screenHeight;

			var __scaleRatio:number = Math.min (__scaleX, __scaleY);
				
			__x = (this.m_XApp.getCanvasWidth () - __screenWidth * __scaleRatio) / 2;
			__y = (this.m_XApp.getCanvasHeight () - __screenHeight * __scaleRatio) / 2;

			this.scaleLayer (i, __x, __scaleRatio, __y, __scaleRatio);
		}
	}

//------------------------------------------------------------------------------------------
	public scaleLayer (__layerNum:number, __x:number, __scaleX:number, __y:number, __scaleY:number):void {
		var __layer:PIXI.Sprite = this.world.getLayerContainer (__layerNum);

		__layer.x = __x;
		__layer.y = __y;
		__layer.scale.x = __scaleX * G.scaleRatio;
		__layer.scale.y = __scaleY * G.scaleRatio;
	}

//------------------------------------------------------------------------------------------
	public getLevelObject ():XLevel {
		return this.m_levelObject;
	}

//------------------------------------------------------------------------------------------
	public setLevelObject ():XLevel {
		return this.m_levelObject;
	}

//------------------------------------------------------------------------------------------
    public getGameInstance ():XGameInstance {
		return this.m_gameInstance;
	}
		
//------------------------------------------------------------------------------------------
	public setGameInstance (__gameInstance:XGameInstance):XGameObject {
		this.m_gameInstance = __gameInstance;
			
		return this;
    }
        
//------------------------------------------------------------------------------------------
}