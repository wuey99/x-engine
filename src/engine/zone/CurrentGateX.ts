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

	//------------------------------------------------------------------------------------------
	export class CurrentGateX extends XLogicObjectCX {
		public script:XTask;
		
		public m_WaterCurrentX:any; // <Dynamic>
		
		public m_direction:string;
		public m_currentX:number;
		public m_currentY:number;
		
		public m_zone:number;
		public m_message:string;
		
		public m_zoneStartedListenerID:number;
		public m_zoneFinishedListenerID:number;
		
		//------------------------------------------------------------------------------------------
		public $setup (__xxx:XWorld, args:Array<any>):void {
			super.$setup (__xxx, args);
		
			this.m_WaterCurrentX = this.getArg (args, 0);
			
			this.createSprites ();
		}
		
		//------------------------------------------------------------------------------------------
		public $setupX ():void {
			super.$setupX ();

			this.setCX (-64, 64, -64, 64);
	
			this.m_zoneStartedListenerID = this.getLevelGameInstance ().addZoneStartedListener (this.onZoneStarted);
			this.m_zoneFinishedListenerID = this.getLevelGameInstance ().addZoneFinishedListener (this.onZoneFinished);
			
			this.__setupItemParamsXML ();
			this.__setupSpawnScript ();
			this.__setupDetectionScript ();
			
			this.oVisible = true;
        }

		//------------------------------------------------------------------------------------------
		public cleanup ():void {
			super.cleanup ();
			
			this.getLevelGameInstance ().removeZoneStartedListener (this.m_zoneStartedListenerID);
			this.getLevelGameInstance ().removeZoneFinishedListener (this.m_zoneFinishedListenerID);
		}
		
		//------------------------------------------------------------------------------------------
		public cullObject ():void {	
		}
		
		//------------------------------------------------------------------------------------------
		// create sprites
		//------------------------------------------------------------------------------------------
		public createSprites ():void {
		}

		//------------------------------------------------------------------------------------------
		public setXMapModel (__layer:number, __XMapModel:XMapModel, __XMapView:XMapView=null):void {
			super.setXMapModel (__layer, __XMapModel, __XMapView);
			
			if (!this.hasItemStorage ()) {
				this.initItemStorage ({"state": 1});
			}
			
			this.__setState ();
		}
		
		//------------------------------------------------------------------------------------------
		private __setState ():void {
			if (this.getItemStorage ().state == 2) {
				this.m_currentX *= -1.0;
				this.m_currentY *= -1.0;
				
				switch (this.m_direction) {
					case "left":
						this.m_direction = "right";
						break;
					case "right":
						this.m_direction = "left";
						break;
					case "up":
						this.m_direction = "down";
						break;
					case "down":
						this.m_direction = "up";
						break;
				}
			}
		}
		
		//------------------------------------------------------------------------------------------
		private __setupItemParamsXML ():void {
			this.setupItemParamsXML ();
			
			this.m_currentX = this.m_currentY = 0.0;
			
			this.m_zone = -1;
			if (this.itemHasAttribute ("zone")) {
				this.m_zone = this.itemGetAttributeInt ("zone");
			}
			
			this.m_message = "";
			if (this.itemHasAttribute ("message")) {
				this.m_message = this.itemGetAttributeString ("message");	
			}
			
			if (this.itemHasAttribute ("direction")) {
				this.m_direction = this.itemGetAttributeString ("direction");
				
				switch (this.m_direction) {
					case "left":
						this.m_currentX = -1.0;
						break;
					case "right":
						this.m_currentX = 1.0;
						break;
					case "up":
						this.m_currentY = -1.0;
						break;
					case "down":
						this.m_currentY = 1.0;
						break;
				}
			}
		}
		
		//------------------------------------------------------------------------------------------
		private __setupSpawnScript ():void {
			var __dx:number, __dy:number;
			
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0600,
					
					() => {
						__dx = Math.abs (this.getLevelGameInstance ().getMickeyObject ().oX - this.oX);
						__dy = Math.abs (this.getLevelGameInstance ().getMickeyObject ().oY - this.oY);
						
						if (__dx < 512 && __dy < 512) {
							this.__spawnWaterCurrent ();	
						}
					},
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
			]);
		}
		
		//------------------------------------------------------------------------------------------
		private __spawnWaterCurrent ():void {	
			var __logicObject:XGameObjectCX = this.world.getXLogicManager ().initXLogicObject (
				// parent
				this,
				// logicObject
				XType.createInstance (this.m_WaterCurrentX) as XGameObject,
				// item, layer, depth
				null, this.getLayer (), this.getDepth (),
				// x, y, z
				0, 0, 0,
				// scale, rotation
				1.0, 0
			) as XGameObjectCX;
			
			switch (this.m_direction) {
				case "left":
					__logicObject.oDX = -6.0;
					__logicObject.oX += Math.random () * 32 - 16;
					__logicObject.oY += Math.random () * 96 - 48;
					__logicObject.oRotation = 90.0;
					break;
				case "right":
					__logicObject.oDX = 6.0;
					__logicObject.oX += Math.random () * 32 - 16;
					__logicObject.oY += Math.random () * 96 - 48;
					__logicObject.oRotation = 270.0;
					break;
				case "up":
					__logicObject.oDY = -6.0;
					__logicObject.oX += Math.random () * 96 - 48;
					__logicObject.oY += Math.random () * 32 - 16;
					__logicObject.oRotation = 0.0;
					break;
				case "down":
					__logicObject.oDY = 6.0;
					__logicObject.oX += Math.random () * 96 - 48;
					__logicObject.oX += Math.random () * 32 - 16;
					__logicObject.oRotation = 180.0;
					break;				
			}
			
			this.addGameObjectAsChild (__logicObject);
		}
		
		//------------------------------------------------------------------------------------------
		private __setupDetectionScript ():void {
			var __mickeyRect:XRect = new XRect ();
			var __currentRect:XRect = new XRect ();
			
			this.getCX ().copy2 (__currentRect);
			__currentRect.offset (this.oX, this.oY);
			__currentRect.inflate (16, 16);
			
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
					
					XTask.FLAGS, (__task:XTask) => {
						if (!this.getLevelGameInstance ().getLevelComplete ()) {
							this.getLevelGameInstance ().getMickeyObject ().getCX ().copy2 (__mickeyRect);
							__mickeyRect.offsetPoint (this.getLevelGameInstance ().getMickeyObject ().getPos ());
							
							__task.ifTrue (__currentRect.intersects (__mickeyRect));
						}
						else
						{
							__task.ifTrue (false);
						}
							
						}, XTask.BNE, "loop",
						
						() => {
							var __dx:number;
							var __dy:number;
							
							__dx = this.getLevelGameInstance ().getMickeyObject ().extraDX;
							if (this.m_currentX < 0) {
								__dx = Math.max (-16, __dx + this.m_currentX);
							}
							else
							{
								__dx = Math.min ( 16, __dx + this.m_currentX);
							}
							this.getLevelGameInstance ().getMickeyObject ().extraDX = __dx;
							
							__dy = this.getLevelGameInstance ().getMickeyObject ().extraDY;
							if (this.m_currentY < 0) {
								__dy = Math.max (-16, __dy + this.m_currentY);
							}
							else
							{
								__dy = Math.min ( 16, __dy + this.m_currentY);
							}
							this.getLevelGameInstance ().getMickeyObject ().extraDY = __dy;
						},
						
						XTask.GOTO, "loop",
					
					XTask.RETN,
			]);		
		}
		
		//------------------------------------------------------------------------------------------
		public getZone ():number {
			return this.m_zone;
		}
					
		//------------------------------------------------------------------------------------------
		private onZoneStarted (__zone:number):void {
		}
					
		//------------------------------------------------------------------------------------------
		private onZoneFinished (__zone:number):void {
			if (this.getZone () != __zone) {
				return;
			}
						
			if (this.getZone () == 1) {
				return;
			}
						
			if (this.getItemStorage ().state == 2) {
				return;
			}
			
			this.getItemStorage ().state = 2;
			
			this.__setState ();
		}
					
	//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }