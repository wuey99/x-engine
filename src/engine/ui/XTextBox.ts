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
import { XTextSprite } from '../sprite/XTextSprite';
import { XTextGameObject } from './XTextGameObject';
import { Box } from './Box';
import { XJustify } from './XJustify';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class XTextBox extends XTextGameObject {
    public m_9width:number;
    public m_9height:number;
    public m_box:Box;

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
		this.m_9width = __params[this.m_paramIndex++];
        this.m_9height = __params[this.m_paramIndex++];
        var __fillColor:number = __params[this.m_paramIndex++];

		var __box:Box = this.m_box = this.addGameObjectAsChild (Box, this.getLayer (), this.getDepth (), false) as Box;
		__box.afterSetup ([this.m_9width, this.m_9height, XJustify.NONE, __fillColor]);
		
		super.afterSetup (__params);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public getBox ():Box {
		return this.m_box;
	}
	
//------------------------------------------------------------------------------------------
// setupText
//------------------------------------------------------------------------------------------
	public createSprites (
		__width:number=32,
		__height:number=32,
		__text:string="",
		__fontName:string="Nunito",
		__fontSize:number=12,
		__color:number=0x000000,
		__bold:boolean=false,
		__horzAlign:string="left",
		__vertAlign:string="top"
	):void {
		this.m_textSprite = this.createXTextSprite (
			__width,
			__height,
			__text,
			__fontName,
			__fontSize,
			__color,
			__bold,
			__horzAlign,
			__vertAlign
		);

        this.m_box.addItem (this.m_textSprite);
		this.m_box.addSortableChild (this.m_textSprite, this.getLayer (), this.getDepth () + 1, false);
			
		this.show ();
	}

//------------------------------------------------------------------------------------------
	// @ts-ignore
	public get width ():number {
		return this.m_9width;
	}

//------------------------------------------------------------------------------------------
	// @ts-ignore
	public get height ():number {
		return this.m_9height;
	}

//------------------------------------------------------------------------------------------
}