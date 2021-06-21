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
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { GUID } from '../../engine/utils/GUID';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XButton } from '../../engine/ui/XButton';
import { XSpriteButton } from '../../engine/ui/XSpriteButton';
import { XTextButton } from '../../engine/ui/XTextButton';
import { XTextSpriteButton } from '../../engine/ui/XTextSpriteButton';
import { XTextGameObject } from '../../engine/ui/XTextGameObject';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { Box } from '../ui/Box';
import { HBox } from '../ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../ui/XJustify';
import { Spacer } from '../ui/Spacer';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { XMLSprite } from './XMLSprite';

//------------------------------------------------------------------------------------------
export class XMLAnimatedSprite extends XMLSprite {

//------------------------------------------------------------------------------------------
    public createSprites (__params:Array<any> = null):void {
        var __assetName:string = __params[0];
        var __scaleX:number = __params[1];
        var __scaleY:number = __params[2];

        this.m_sprite = this.createAnimatedSprite (__assetName);
        this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);
        this.scale.x = __scaleX;
        this.scale.y = __scaleY;
        
        this.show ();
    }

//------------------------------------------------------------------------------------------
	public getSprite ():PIXI.AnimatedSprite {
		return this.m_sprite as PIXI.AnimatedSprite;
	}

//------------------------------------------------------------------------------------------
	public get width ():number {
		return this.m_sprite.width;
	}

//------------------------------------------------------------------------------------------
	public get height ():number {
		return this.m_sprite.height;
	}

//------------------------------------------------------------------------------------------
	public getPivotX ():number {
		return this.m_sprite.pivot.x;
	}

//------------------------------------------------------------------------------------------
	public getPivotY ():number {
		return this.m_sprite.pivot.y;
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