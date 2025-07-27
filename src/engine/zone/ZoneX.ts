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
import { XLogicObjectCX } from '../gameobject/XLogicObjectCX';

//------------------------------------------------------------------------------------------
export class ZoneX extends XLogicObjectCX {
	public script:XTask;
		
	public m_zone:number;
	public m_direction:string;
	public m_size:number;

	//------------------------------------------------------------------------------------------
	public $setup (__xxx:XWorld, args:Array<any>):void {
		super.$setup (__xxx, args);
			
		this.createSprites ();
	}
		
	//------------------------------------------------------------------------------------------
	public $setupX ():void {
		super.$setupX ();
		
		this.setCX (0, 96, 0, 96);
		
		this.__setupItemParamsXML ();
	}

	//------------------------------------------------------------------------------------------
	public cullObject ():void {	
	}
		
	//------------------------------------------------------------------------------------------
	// create sprites
	//------------------------------------------------------------------------------------------
	public override createSprites ():void {
	}
		
     //------------------------------------------------------------------------------------------
	public getZone ():number {
		return this.m_zone;
	}

	//------------------------------------------------------------------------------------------
	private  __setupItemParamsXML ():void {
		var __mickeyRect:XRect = new XRect ();
		var __zoneRect:XRect = new XRect ();
		var __zoneRectX:XRect = new XRect ();
			
		this.boundingRect.copy2 (__zoneRect);
		__zoneRect.offset (this.oX, this.oY);
			
		this.setupItemParamsXML ();
			
		if (this.itemHasAttribute ("x") && this.itemHasAttribute ("y") && this.itemHasAttribute ("width") && this.itemHasAttribute ("height")) {
			this.boundingRect.setRect (
				this.itemGetAttributeFloat ("x"),
				this.itemGetAttributeFloat ("y"),
				this.itemGetAttributeFloat ("width"),
				this.itemGetAttributeFloat ("height")
			);
		} else {
			this.boundingRect.setRect (0, 0, 0, 0);
		}
			
		this.m_direction = "both";
		if (this.m_xml.hasAttribute ("direction")) {
			this.m_direction = this.m_xml.getAttribute ("direction");	
		}
			
		this.m_size = 256;
		if (this.m_xml.hasAttribute ("size")) {
			this.m_size = this.m_xml.getAttribute ("size");
		}
			
		this.m_zone = this.itemGetAttributeInt ("zone");
			
		this.script = this.addEmptyTask ();
			
		this.getCX ().copy2 (__zoneRectX);
		__zoneRectX.offset (this.oX, this.oY);
		if (this.m_direction == "both") {
			__zoneRectX.inflate (this.m_size, this.m_size);
		}		
		if (this.m_direction == "horz") {
			__zoneRectX.inflate (this.m_size, 64);
		}
		if (this.m_direction == "vert") {
			__zoneRectX.inflate (64, this.m_size);
		}
			
		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,
					
				XTask.FLAGS, (__task:XTask) => {
					if (this.getLevelGameInstance ().getMickeyObject () != null && !this.getLevelGameInstance ().getLevelComplete ()) {
							this.getLevelGameInstance ().getMickeyObject ().getCX ().copy2 (__mickeyRect);
							__mickeyRect.offsetPoint (this.getLevelGameInstance ().getMickeyObject ().getPos ());
							
							__task.ifTrue (__zoneRect.intersects (__mickeyRect));
							
							if (__zoneRectX.intersects (__mickeyRect)) {
								var __dx:number, __dy:number;
								
								__dx = this.oX - this.getLevelGameInstance ().getMickeyObject ().getPos ().x;
								__dy = this.oY - this.getLevelGameInstance ().getMickeyObject ().getPos ().y;
								
								__dx = Math.abs (__dx);  __dy = Math.abs (__dy);
								
								if (this.m_direction == "horz" && __dy < 32) {
									__task.ifTrue (true);
								}
								
								if (this.m_direction == "vert" && __dx < 32) {
									__task.ifTrue (true);
								}
							}
						} else {
							__task.ifTrue (false);
						}
						
//						trace (": zone: ", __zoneRect.intersects (__mickeyRect));
						
					}, XTask.BNE, "loop",
				
				() => {
// #TODO make sure this uses the ZoneManager
					if (this.getLevelGameInstance ().getCurrentZone () != this.m_zone) {
						this.getLevelGameInstance ().setCurrentZone (this.m_zone);	
						
						this.getLevelGameInstance ().fireZoneStartedSignal ();
					}
				},
				
				XTask.RETN,
			]);			
		}
		
	//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }