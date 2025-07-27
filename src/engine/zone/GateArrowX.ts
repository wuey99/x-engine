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
import { XLogicObject } from '../gameobject/XLogicObject';

	//------------------------------------------------------------------------------------------
	export class GateArrowX extends XLogicObject {
		public m_sprite:PIXI.AnimatedSprite;
		public script:XTask;
		public gravity:XTask;
		
		public m_direction:string;
		
		private oDX:number;
		private oDY:number;
		
		//------------------------------------------------------------------------------------------
		public constructor () {
			super ();
		}
		
		//------------------------------------------------------------------------------------------
		public $setup (__xxx:XWorld, args:Array<any>):void {
			super.$setup (__xxx, args);
			
			this.m_direction = this.getArg (args, 0);
			
			this.createSprites ();
		}
		
		//------------------------------------------------------------------------------------------
		public $setupX ():void {
			super.$setupX ();
			
			this.gravity = this.addEmptyTask ();
			this.script = this.addEmptyTask ();
			
			this.gravity.gotoTask (this.getPhysicsTaskX (0.25));
			
			this.oDX = this.oDY = 0;
			
			this.Move_Script ();
			
			this.oAlpha = 0.0;
			
			this.addTask ([
				XTask.LOOP, 10,
					XTask.WAIT, 0x0100,
					
					() => {
						this.oAlpha = Math.min (0.75, this.oAlpha + 0.10);
					}, 
					
				XTask.NEXT,
				
				XTask.WAIT, 0x0800,
				
				XTask.LOOP, 10,
					XTask.WAIT, 0x0100,
					
					() => {
						this.oAlpha = Math.max (0.0, this.oAlpha - 0.10);
					}, 
				
				XTask.NEXT,
				
				() => {
					this.nukeLater ();
				},
				
				XTask.WAIT, 0x0400,
				
				XTask.RETN,
			]);
		}
		
		//------------------------------------------------------------------------------------------
		// create sprites
		//------------------------------------------------------------------------------------------
		public createSprites ():void {
			this.m_sprite = this.createAnimatedSpriteX ("GO");
			this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);

			this.addTask ([
				XTask.LABEL, "loop",
					() => { this.m_sprite.gotoAndStop (3); }, XTask.WAIT, 0x0100,
					() => { this.m_sprite.gotoAndStop (4); }, XTask.WAIT, 0x0100,
					() => { this.m_sprite.gotoAndStop (5); }, XTask.WAIT, 0x0100,
					() => { this.m_sprite.gotoAndStop (6); }, XTask.WAIT, 0x0100,
					() => { this.m_sprite.gotoAndStop (7); }, XTask.WAIT, 0x0100,
					() => { this.m_sprite.gotoAndStop (8); }, XTask.WAIT, 0x0100,
					() => { this.m_sprite.gotoAndStop (9); }, XTask.WAIT, 0x0100,
					
					XTask.GOTO, "loop",
					
				XTask.RETN,
			]);
			
			this.addTask ([
				XTask.WAIT, 0x0100,
				
				() => {
					if (this.m_direction == "right") {
						this.oRotation  = 0;
						this.oDX = 8.0;
						this.oDY = 0.0;
					}
					if (this.m_direction == "up") {
						this.oRotation = 270;
						this.oDX = 0.0;
						this.oDY = -8.0;
					}
					if (this.m_direction == "left") {
						this.oRotation = 180;
						this.oDX = -8.0;
						this.oDY = 0.0;
					}
					if (this.m_direction == "down") {
						this.oRotation = 90;
						this.oDX = 0.0;
						this.oDY = 8.0;
					}
				},
				
				XTask.RETN,
			]);
			
			this.show ();
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
			this.oX += this.oDX;
			this.oY += this.oDY;
		}
		
		//------------------------------------------------------------------------------------------
		public Move_Script ():void {
			
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
	}
	
//------------------------------------------------------------------------------------------
// }