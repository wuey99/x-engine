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
	export class DoorX extends XLogicObjectCX {
		public m_sprite:PIXI.AnimatedSprite;

		public script:XTask;
		public gravity:XTask;
		
		public m_trigger:number;
		
		public m_opened:boolean = false;
		
		public m_triggerListener:number;
		
		//------------------------------------------------------------------------------------------
		public $setup (__xxx:XWorld, args:Array<any>):void {
			super.$setup (__xxx, args);
			
			this.createSprites ();
		}
		
		//------------------------------------------------------------------------------------------
		public $setupX ():void {
			super.$setupX ();

			this.setCX (-8, 8, -8, 8);
			
			var __xml:XSimpleXMLNode = this.m_xml = new XSimpleXMLNode ();
			__xml.setupWithXMLString (this.item.params);

			this.m_trigger = -1;
			if (__xml.hasAttribute ("trigger")) {
				this.m_trigger = __xml.getAttribute ("trigger");
			}

			this.gravity = this.addEmptyTask ();
		    this.script = this.addEmptyTask ();
			
			this.gravity.gotoTask (this.getPhysicsTaskX (0.25));
			
			this.Idle_Script ();
			
			this.m_triggerListener = this.getLevelGameInstance ().addTriggerListener (this.triggerDoor);
			
			this.m_opened = false;
			
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
			
			this.getLevelGameInstance ().removeTriggerListener (this.m_triggerListener);
		}
		
		//------------------------------------------------------------------------------------------
		public cullObject ():void {	
		}
		
		//------------------------------------------------------------------------------------------
		public setXMapModel (__layer:number, __XMapModel:XMapModel, __XMapView:XMapView=null):void {
			console.log (":  GateX: setXMapModel: ", __layer, __XMapModel, __XMapView);
			console.log (": xml: ", this.m_xml.toXMLString ());
			
			super.setXMapModel (__layer, __XMapModel, __XMapView);
			
			console.log (": getXMapLayerModel: ", this.getXMapLayerModel ());

			this.setCXTiles ();
		}

		//------------------------------------------------------------------------------------------
		public triggerDoor (__trigger:number):void {
			if (this.m_opened) {
				return;
			}
			
			if (__trigger == this.m_trigger) {
				this.m_opened = true;
				
				this.Open_Script (
					() => {
					}
				);
			}
		}
		
		//------------------------------------------------------------------------------------------
		public eraseCXTiles ():void {
			var c1:number, r1:number, c2:number, r2:number;
			
			var __r:XRect =  this.world.getXRectPoolManager ().borrowObject () as XRect;
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
		public Idle_Script ():void {
			
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
					XTask.WAIT, 0x0100,	
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
				
				//------------------------------------------------------------------------------------------			
			]);
			
			//------------------------------------------------------------------------------------------
		}
		
		
		//------------------------------------------------------------------------------------------
		public Open_Script (__finallyCallback:any):void {
			
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
	
				XTask.LABEL, "wait",
					XTask.WAIT, 0x0100,
					
					XTask.GOTO, "wait",
				
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