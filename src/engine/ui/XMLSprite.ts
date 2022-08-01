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
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XState } from '../state/XState';
import { GUID } from '../utils/GUID';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XButton } from './XButton';
import { XSpriteButton } from './XSpriteButton';
import { XTextButton } from './XTextButton';
import { XTextSpriteButton } from './XTextSpriteButton';
import { XTextGameObject } from './XTextGameObject';
import { XTextSprite } from '../sprite/XTextSprite';
import { Box } from './Box';
import { HBox } from './HBox';
import { VBox } from './VBox';
import { XJustify } from './XJustify';
import { Spacer } from './Spacer';
import { XType } from '../type/XType';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class XMLSprite extends XGameObject {
    public m_sprite:PIXI.Sprite;
    public script:XTask;

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

        this.createSprites (__params);

        this.script = this.addEmptyTask ();

        this.Idle_Script ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites (__params:Array<any> = null):void {
        var __assetName:string = __params[0];
        var __scaleX:number = __params[1];
        var __scaleY:number = __params[2];
        var __pivotX:number = __params[3];
        var __pivotY:number = __params[4];

        this.m_sprite = this.createSprite (__assetName);

		var __pivot = this.getPivot ();
		__pivot.x = this.m_sprite.width * __pivotX;
		__pivot.y = this.m_sprite.height * __pivotY;
		
        this.addSpriteAsChild (
            this.m_sprite, 
            -this.m_sprite.width * __pivotX, -this.m_sprite.height * __pivotY, 
            this.getLayer (), this.getDepth (), 
            false
        );
        this.scale.x = __scaleX;
        this.scale.y = __scaleY;
        
        this.show ();
    }

//------------------------------------------------------------------------------------------
	// @ts-ignore
	public get width ():number {
		return this.m_sprite.width;
	}

//------------------------------------------------------------------------------------------
	// @ts-ignore
	public get height ():number {
		return this.m_sprite.height;
	}

//------------------------------------------------------------------------------------------
	public Idle_Script ():void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
						
						XTask.GOTO, "loop",
						
					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }
        
//------------------------------------------------------------------------------------------
}