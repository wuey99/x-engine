//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "GX-Engine"
//
// Copyright (c) 2014 Jimmy Huey (wuey99@gmail.com)
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
import { XMapItemModel } from '../xmap/XMapItemModel';
import { XMapLayerModel } from '../xmap/XMapLayerModel';
import { XRect } from '../geom/XRect';
import { XSubmapModel } from '../xmap/XSubmapModel';
import { XLevelGameInstance } from '../level/XLevelGameInstance';
import { XGameObjectCX } from '../gameobject/XGameObjectCX';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XMapModel } from '../xmap/XMapModel';
import { XMapView } from '../xmap/XMapView';
import { XPoint } from '../geom/XPoint';
import { XLogicObjectCX } from '../gameobject/XLogicObjectCX';
import { GateX } from './GateX';
	
	//------------------------------------------------------------------------------------------
	export class Vert_GateX extends GateX {
		
		//------------------------------------------------------------------------------------------
		// create sprites
		//------------------------------------------------------------------------------------------
		public createSprites ():void {
			this.m_sprite = this.createAnimatedSpriteX ("Vert_Gate");
			this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);

			this.show ();
		}

		//------------------------------------------------------------------------------------------
		public openGateAnimationX ():Array<any> {
			var __guid:number;
			
			return [				
				() => { this.m_sprite.gotoAndStop (1); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (2); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (3); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (4); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (5); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (6); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (7); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (8); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (9); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (10); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (11); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (12); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (13); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (14); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (15); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (16); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.visible = false;  }, XTask.WAIT, 0x0300,
				
				XTask.RETN,
			];
		}
		
		//------------------------------------------------------------------------------------------
		public closeGateAnimationX ():Array<any> {
			var __guid:number;
			
			return [
				() => { this.m_sprite.gotoAndStop (16); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (15); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (14); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (13); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (12); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (11); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (10); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (9); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (8); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (7); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (6); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (5); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (4); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (3); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (2); }, XTask.WAIT, 0x0300,
				() => { this.m_sprite.gotoAndStop (1); }, XTask.WAIT, 0x0300,
				
				XTask.RETN,
			];
		}
		
	//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }