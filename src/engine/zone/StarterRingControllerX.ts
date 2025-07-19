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
import { XMickey } from '../level/XMickey';
import { StarterRingX } from './StarterRingX';
import { XLogicObjectCX } from '../gameobject/XLogicObjectCX';

	//------------------------------------------------------------------------------------------
	export class StarterRingControllerX extends XLogicObjectCX {
		public m_sprite:PIXI.AnimatedSprite;
		public script:XTask;
		public m_zone:number;

		//------------------------------------------------------------------------------------------
		public $setup (__xxx:XWorld, args:Array<any>):void {
			super.$setup (__xxx, args);
			
			this.createSprites ();
		}
		
		//------------------------------------------------------------------------------------------
		public $setupX ():void {
			super.$setupX ();
			
			this.setCX (-8, 8, -8, 8);
			
			var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
			__xml.setupWithXMLString (this.item.params);
			
			this.m_zone = __xml.getAttribute ("zone");

			this.script = this.addEmptyTask ();
			
			this.Ring_Script ();
		
			this.create ();
		}
		
		//------------------------------------------------------------------------------------------
		public create ():void {
			
			if (this.getLevelGameInstance ().getMickeyObject () != null) {
				this.getLevelGameInstance ().getMickeyObject ().addWaitingListener (
					() => {
						console.log (": waiting: ");
						
						this.oVisible = true;
					}
				);
				
				this.getLevelGameInstance ().getMickeyObject ().addPlayingListener (
					() => {
						console.log (": playing: ");
						
						this.oVisible = false;
					}
				);
			}
			
			this.__createClickHereSprite ();
			
			this.addTask ([
				XTask.LABEL, "loop",
					() => { this.__spawnStarterRing (0.20); }, XTask.WAIT, 0x0200,
					() => { this.__spawnStarterRing (0.40); }, XTask.WAIT, 0x0200,
					() => { this.__spawnStarterRing (0.80); }, XTask.WAIT, 0x0200,
					() => { this.__spawnStarterRing (1.20); }, XTask.WAIT, 0x0200,
					() => { this.__spawnStarterRing (1.60); }, XTask.WAIT, 0x0200,
					
					XTask.WAIT, 0x0400,
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
			]);
		}

		//------------------------------------------------------------------------------------------
		public cullObject ():void {	
		}

		//------------------------------------------------------------------------------------------
		private __createClickHereSprite ():void {
            /*
			var __logicObject:XGameObject = this.world.getXLogicManager ().initXLogicObject (
				// parent
				this,
				// logicObject
				new ClickHereMessageX () as XGameObject,
				// item, layer, depth
				null, 0, 0,
				// x, y, z
				0, 0, 0,
				// scale, rotation
				1.0, 0
			) as ClickHereMessageX;
			
            // TODO
			this.addGameObjectAsChild (__logicObject);
            */
		}
		
		//------------------------------------------------------------------------------------------
		private __spawnStarterRing (__scale:number):void {
			if (this.getDistanceToMickey () > 192) {
				return;
			}
			
			var __logicObject:StarterRingX = this.world.getXLogicManager ().initXLogicObjectFromPool (
				// parent
				this,
				// class
				StarterRingX,
				// item, layer, depth
				null, this.getLayer (), this.getDepth (),
				// x, y, z
				0, 0, 0,
				// scale, rotation
				__scale, 0
			) as StarterRingX;
			
            // TODO
			this.addGameObjectAsChild (__logicObject);
		}
		
		//------------------------------------------------------------------------------------------
		// create sprites
		//------------------------------------------------------------------------------------------
		public createSprites ():void {
			this.show ();
		}
		
		//------------------------------------------------------------------------------------------
		public getZone ():number {
			return this.m_zone;
		}
		
		//------------------------------------------------------------------------------------------
		public updatePhysics ():void {
			super.updatePhysics ();
		}
		
		//------------------------------------------------------------------------------------------
		public Ring_Script ():void {
			
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
					
					/*
					function ():Void { m_sprite.gotoAndStop (1); }, XTask.WAIT, 0x0800,
					function ():Void { m_sprite.gotoAndStop (2); }, XTask.WAIT, 0x0800,
					*/
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
			]);
			
		//------------------------------------------------------------------------------------------
		}

		//------------------------------------------------------------------------------------------	
		private getDistanceToMickey ():number {
			if (this.getLevelGameInstance ().getMickeyObject () != null) {
				var __mickeyObject:XMickey = this.getLevelGameInstance ().getMickeyObject ();
				
				var __dx:number = __mickeyObject.oX - this.oX;
				var __dy:number = __mickeyObject.oY - this.oY;
				
				var __distance:number = this.world.approxDistance (__dx, __dy);
				
				return __distance;
			} else {
				return 0;
			}
		}
		
	//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }