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
	export class WaterCurrentX extends XLogicObjectCX {
		public m_bitmap:PIXI.AnimatedSprite;
		
		//------------------------------------------------------------------------------------------
		public constructor () {
			super ();
		}
		
		//------------------------------------------------------------------------------------------
		public $setup (__xxx:XWorld, args:Array<any>):void {
			super.$setup (__xxx, args);
			
			this.createSprites ();
		}
		
		//------------------------------------------------------------------------------------------
		public $setupX ():void {
			super.$setupX ();
			
			this.setCX (-8, 8, -8, 8);
			
			this.oAlpha = 0.0;
			
			var __alpha:number = Math.floor (Math.random () * 7) + 7;
			
			this.addTask ([
				XTask.LOOP, __alpha,
					XTask.WAIT, 0x0100,
					
					() => {
						this.oAlpha = Math.min (1.0, this.oAlpha + 0.05);
					},
				XTask.NEXT,
					
				XTask.LOOP, __alpha,
					XTask.WAIT, 0x0100,
					
					() => {
						this.oAlpha = Math.max (0.0, this.oAlpha - 0.05);
					},
				XTask.NEXT,
				
				XTask.RETN,
			]);
			
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
					
					() => {
						this.oX += this.oDX;
						this.oY += this.oDY;
					},
					
					XTask.GOTO, "loop",
				XTask.RETN,
			]);
			
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x2000,
					
					() => {
						this.nukeLater ();
					},
					
				XTask.RETN,
			]);
			
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
					
					() => { this.m_bitmap.gotoAndStop (1); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (2); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (3); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (4); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (5); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (6); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (5); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (4); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (3); }, XTask.WAIT, 0x0200,
					() => { this.m_bitmap.gotoAndStop (2); }, XTask.WAIT, 0x0200,
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
			]);
		}
		
		//------------------------------------------------------------------------------------------
		// create sprites
		//------------------------------------------------------------------------------------------
		public createSprites ():void {
			this.m_bitmap = this.createAnimatedSpriteX ("WaterCurrent");
			this.addSortableChild (this.m_bitmap, this.getLayer (), this.getDepth (), false);
			
			this.show ();
		}
		
		
	//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }