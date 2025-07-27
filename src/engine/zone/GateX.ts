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
	export class GateX extends XLogicObjectCX {
		public m_sprite:PIXI.AnimatedSprite;
		public m_goSprite:PIXI.AnimatedSprite;
		
		public script:XTask;
		public gravity:XTask;
		
		public m_zone:number;
		public m_exit:boolean;
		public m_gate:number;
		public m_direction:string;
		public m_go:boolean;
		
		public m_GateArrowX:any; // <Dynamic>
		
		public m_zoneStartedListenerID:number;
		public m_zoneFinishedListenerID:number;
		
		//------------------------------------------------------------------------------------------
		public $setup (__xxx:XWorld, args:Array<any>):void {
			super.$setup (__xxx, args);
			
			if (args.length == 0) {
				this.m_GateArrowX = null;
			} else {
				this.m_GateArrowX = this.getArg (args, 0);
			}
			
			this.createSprites ();
		}
		
		//------------------------------------------------------------------------------------------
		public $setupX ():void {
			super.$setupX ();

			this.setCX (-8, 8, -8, 8);
			
			var __xml:XSimpleXMLNode = this.m_xml = new XSimpleXMLNode ();
			__xml.setupWithXMLString (this.item.params);
			
			this.m_zone = __xml.getAttribute ("zone");
			this.m_exit = __xml.getAttribute ("exit") == "true";
			
			this.m_direction = "null";
			if (__xml.hasAttribute ("direction")) {
				this.m_direction = __xml.getAttribute ("direction");
			}
			
			if (!this.m_exit) {
				this.m_gate = __xml.getAttribute ("gate");
			}
			
			this.m_go = false;
			
			console.log (": zone, exit: ", this.m_zone, this.m_exit, this.m_gate);
			
			if (!this.m_exit) {
				if (this.m_gate == 1) {
					this.m_sprite.visible = false;
				} else {
					this.m_sprite.visible = true;
				}
			}
			
			this.m_zoneStartedListenerID = this.getLevelGameInstance ().addZoneStartedListener (this.onZoneStarted);
			this.m_zoneFinishedListenerID = this.getLevelGameInstance ().addZoneFinishedListener (this.onZoneFinished);
			
			this.createGoSprite ();
			
			this.gravity = this.addEmptyTask ();
			this.script = this.addEmptyTask ();
			
			this.gravity.gotoTask (this.getPhysicsTaskX (0.25));
			
			this.Locked_Script ();
			
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
					
					() => {
					}, 
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
			]);
		}

		//------------------------------------------------------------------------------------------
		public cleanup ():void {
			super.cleanup ();
			
			this.getLevelGameInstance ().removeZoneStartedListener (this.m_zoneStartedListenerID);
			this.getLevelGameInstance ().removeZoneFinishedListener (this.m_zoneFinishedListenerID);
		}

		//------------------------------------------------------------------------------------------
		public createGoSprite ():void {
			if (this.m_direction == "null" || this.m_GateArrowX == null) {
				return;
			}
			
			this.m_goSprite = this.createAnimatedSpriteX ("GO");
			this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);

			 var __r:XRect = this.boundingRect;
			
			// this.x_goSprite = this.addSpriteAt (m_goSprite, -(__r.right-__r.left)/2, -(__r.bottom - __r.top)/2);
			
			this.m_goSprite.gotoAndStop (3);
			this.m_goSprite.visible = false;
			this.m_go = false;
			
			if (this.m_direction == "right") {
				this.m_goSprite.rotation = 0;
			}
			if (this.m_direction == "up") {
				this.m_goSprite.rotation = 270;
			}
			if (this.m_direction == "left") {
				this.m_goSprite.rotation = 180;
			}
			if (this.m_direction == "down") {
				this.m_goSprite.rotation = 90;
			}
			
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
					
					XTask.FLAGS, (__task:XTask) => {
						__task.ifTrue (this.m_go);
					}, XTask.BNE, "loop",
					
					XTask.LOOP, 3,
					
						XTask.WAIT, 0x0900,
						
						() => {
							var __logicObject:XGameObject = this.world.getXLogicManager ().initXLogicObject (
								// parent
								this.getLevelGameInstance ().getLevelObject (),
								// logicObject
								 XType.createInstance (this.m_GateArrowX) as XGameObject,
								// item, layer, depth
								null, 0, this.getDepth () + 1,
								// x, y, z
								this.getPos ().x + (__r.right - __r.left)/2, this.getPos ().y + (__r.bottom - __r.top)/2 , 0,
								// scale, rotation
								1.0, 0,
								[
									this.m_direction
								]
							) as XGameObject;
							
						    this.getLevelGameInstance ().getLevelObject ().addXLogicObject (__logicObject);
						},
					
					XTask.NEXT,
					
					XTask.WAIT, 0x1400,
					
					XTask.GOTO, "loop",
					
					XTask.RETN,
			]);
		}
		
		//------------------------------------------------------------------------------------------
		public cullObject ():void {	
		}
		
		//------------------------------------------------------------------------------------------
		public setXMapModel (__layer:number, __XMapModel:XMapModel, __XMapView:XMapView=null):void {
			console.log (":  GateX: setXMapModel: ", __layer, __XMapModel, __XMapView);
			console.log (": xml: ", this.m_xml.toXMLString ());
			
			super.setXMapModel (__layer, __XMapModel, __XMapView);

			if (!this.hasItemStorage ()) {
				this.initItemStorage ({"state": 1});
			}
			
			console.log (": getXMapLayerModel: ", this.getXMapLayerModel ());
			
			if (this.m_exit) {
				this.setCXTiles ();
			}
		}
		
		//------------------------------------------------------------------------------------------
		public getZone ():number {
			return this.m_zone;
		}
		
		//------------------------------------------------------------------------------------------
		private onZoneStarted (__zone:number):void {		
			if (this.getZone () != __zone || this.m_exit) {
				return;
			}
			
			if (this.m_gate == 1) {				
				this.Lowering_Script (
					() => {}
				);
			}
			else
			{
				this.eraseCXTiles ();
				
				this.Opening_Script (this.Unlocked_Entry_Script);
			}
		}
		
		//------------------------------------------------------------------------------------------
		private onZoneFinished (__zone:number):void {
			if (this.getZone () != __zone || !this.m_exit) {
				return;
			}
			
			this.eraseCXTiles ();

			console.log (": ---------->: ", this.getItemStorage ().state);
			
			if (this.getItemStorage ().state == 2) {
				return;
			}
			
			this.getItemStorage ().state = 2;
			
			this.Opening_Script (this.Unlocked_Exit_Script);
		}
		
		//------------------------------------------------------------------------------------------
		public eraseCXTiles ():void {
			var c1:number, r1:number, c2:number, r2:number;
			
			var __r:XRect = this.world.getXRectPoolManager ().borrowObject () as XRect;
			this.getBoundingRect ().copy2 (__r);
			__r.offsetPoint (this.getPos ());
	
			c1 = XType.int (__r.left/XSubmapModel.CX_TILE_WIDTH);
			r1 = XType.int (__r.top/XSubmapModel.CX_TILE_HEIGHT);
			c2 = XType.int (__r.right/XSubmapModel.CX_TILE_WIDTH);
			r2 = XType.int (__r.bottom/XSubmapModel.CX_TILE_HEIGHT);
			
			var __length:number = (c2-c1) * (r2-r1);
			
			var __tiles:Array<number> = new Array<number> ();
	
			var i:number;
			
			for (i = 0; i < __length; i++) {
				__tiles.push (XSubmapModel.CX_EMPTY);
			}
			
			console.log (": xml: ", this.m_xml.toXMLString ());
			console.log (": c1, r1, c2, r2: ", c1, r1, c2, r2);
			console.log (": layerModel: ", this.getXMapLayerModel ());
			
			if (this.getXMapLayerModel () != null) {
				this.getXMapLayerModel ().setCXTiles (__tiles, c1, r1, c2-1, r2-1);
			}
			
			this.world.getXRectPoolManager ().returnObject (__r);
		}
		
		//------------------------------------------------------------------------------------------
		public setCXTiles ():void {
			var c1:number, r1:number, c2:number, r2:number;
			
			var __r:XRect = this.world.getXRectPoolManager ().borrowObject () as XRect;
			this.getBoundingRect ().copy2 (__r);
			__r.offsetPoint (this.getPos ());
			
			c1 = XType.int (__r.left/XSubmapModel.CX_TILE_WIDTH);
			r1 = XType.int (__r.top/XSubmapModel.CX_TILE_HEIGHT);
			c2 = XType.int (__r.right/XSubmapModel.CX_TILE_WIDTH);
			r2 = XType.int (__r.bottom/XSubmapModel.CX_TILE_HEIGHT);
			
			var __length:number = (c2-c1) * (r2-r1);
			
			var __tiles:Array<number> = new Array<number> ();
			
			var i:number;
			
			for (i = 0; i < __length; i++) {
				__tiles.push (XSubmapModel.CX_SOLID);
			}

			console.log (": ----------------------------------------------: ");
			console.log (": xml: ", this.m_xml.toXMLString ());
			console.log (": c1, r1, c2, r2: ", c1, r1, c2, r2);
			console.log (": layerModel: ", this.getXMapLayerModel ());

			if (this.getXMapLayerModel () != null) {
				this.getXMapLayerModel ().setCXTiles (__tiles, c1, r1, c2-1, r2-1);
			}
			
			this.world.getXRectPoolManager ().returnObject (__r);
		}
		
		//------------------------------------------------------------------------------------------
		public getPhysicsTaskX (DECCEL:number):Array<any> {
			return [
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
					this.updatePhysics,	
					XTask.GOTO, "loop",
				
				XTask.RETN,
			];
		}
		
		//------------------------------------------------------------------------------------------
		public updatePhysics ():void {
		}

		//------------------------------------------------------------------------------------------
		public getBoundingRect ():XRect {
			return new XRect (0, 0, 128, 128);	
		}
		
		//------------------------------------------------------------------------------------------
		public Locked_Script ():void {
			
			this.script.gotoTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.script.addTask ([
						XTask.LABEL, "loop",
							XTask.WAIT, 0x0100,
							
							() => {
							},
							
							XTask.GOTO, "loop",
						
						XTask.RETN,
					]);
					
				},
				
				//------------------------------------------------------------------------------------------
				// animation
				//------------------------------------------------------------------------------------------	
				XTask.LABEL, "loop",	
					() => { this.m_sprite.gotoAndStop (1); }, XTask.WAIT, 0x0300,					
				
				XTask.GOTO, "loop",
				
				XTask.RETN,
				
				//------------------------------------------------------------------------------------------			
			]);
			
			//------------------------------------------------------------------------------------------
		}
		
		//------------------------------------------------------------------------------------------
		public Opening_Script (__finallyCallback:any):void {

			this.script.gotoTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.script.addTask ([
						XTask.LABEL, "loop",
							XTask.WAIT, 0x0100,
							
							() => {
							},
							
							XTask.GOTO, "loop",
						
						XTask.RETN,
					]);
					
				},
				
				//------------------------------------------------------------------------------------------
				// animation
				//------------------------------------------------------------------------------------------	
				XTask.LABEL, "loop",	
					XTask.EXEC, this.openGateAnimationX (),
					
					() => {
						__finallyCallback ();
					},
	
//					XTask.GOTO, "loop",
				
				XTask.RETN,
				
				//------------------------------------------------------------------------------------------			
			]);
			
		//------------------------------------------------------------------------------------------
		}
		
		//------------------------------------------------------------------------------------------
		public Lowering_Script (__finallyCallback:any):void {

			this.setCXTiles ();
			
			this.m_sprite.visible = true;
			
			this.m_sprite.gotoAndStop (25);
				
			//------------------------------------------------------------------------------------------
			this.script.gotoTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.script.addTask ([
						XTask.LABEL, "loop",
							XTask.WAIT, 0x0100,
							
							() => {
							},
							
							XTask.GOTO, "loop",
						
						XTask.RETN,
					]);
					
				},
				
				//------------------------------------------------------------------------------------------
				// animation
				//------------------------------------------------------------------------------------------	
				XTask.LABEL, "loop",
					XTask.EXEC, this.closeGateAnimationX (),
					
					() => {
						__finallyCallback ();
					},
				
//					XTask.GOTO, "loop",
				
				XTask.RETN,
				
				//------------------------------------------------------------------------------------------			
			]);
			
			//------------------------------------------------------------------------------------------
		}
		
		//------------------------------------------------------------------------------------------
		public Unlocked_Exit_Script ():void {
//			x_goSprite.visible2 = true;
			this.m_go = true;
			
			if (this.m_goSprite == null) {
				return;
			}
			
			// TODO
			// var __rp:XPoint = this.m_goSprite.getRegistration ();
			var __rp:XPoint = new XPoint (this.m_goSprite.pivot.x, this.m_goSprite.y);

			//------------------------------------------------------------------------------------------		
			this.script.gotoTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.script.addTask ([
						XTask.LABEL, "loop",
							XTask.WAIT, 0x0100,
							
							() => {
							},
							
							XTask.GOTO, "loop",
						
						XTask.RETN,
					]);
					
				},
				
				//------------------------------------------------------------------------------------------
				// animation
				//------------------------------------------------------------------------------------------	
				XTask.LABEL, "loop",						
					XTask.LOOP, 6,
					() => {
						__rp.x -= 4.0;
					}, XTask.WAIT, 0x0100,
					XTask.NEXT,
					
					XTask.LOOP, 12,
					() => {
						__rp.x += 4.0;
					}, XTask.WAIT, 0x0100,
					XTask.NEXT,
					
					XTask.LOOP, 6,
					() => {
						__rp.x -= 4.0;
					}, XTask.WAIT, 0x0100,
					XTask.NEXT,	
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
				
				//------------------------------------------------------------------------------------------			
			]);
			
			//------------------------------------------------------------------------------------------
		}
		
		//------------------------------------------------------------------------------------------
		public Unlocked_Entry_Script ():void {

			//------------------------------------------------------------------------------------------		
			this.script.gotoTask ([
				
				//------------------------------------------------------------------------------------------
				// control
				//------------------------------------------------------------------------------------------
				() => {
					this.script.addTask ([
						XTask.LABEL, "loop",
							XTask.WAIT, 0x0100,
							
							() => {
							},
							
							XTask.GOTO, "loop",
						
						XTask.RETN,
					]);
					
				},
				
				//------------------------------------------------------------------------------------------
				// animation
				//------------------------------------------------------------------------------------------	
				XTask.LABEL, "loop",						
					() => {
						this.eraseCXTiles ();
					},
					
//					XTask.GOTO, "loop",
				
				XTask.RETN,
				
				//------------------------------------------------------------------------------------------			
			]);
			
			//------------------------------------------------------------------------------------------
		}
		
		//------------------------------------------------------------------------------------------
		public openGateAnimationX ():Array<any> {
			return [				
				XTask.RETN,
			];
		}
		
		//------------------------------------------------------------------------------------------
		public closeGateAnimationX ():Array<any> {
			return [
				XTask.RETN,
			];
		}
		
	//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }