//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XPoint } from '../../engine/geom/XPoint';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class InteractiveLayer extends XGameObject {
	public graphics:PIXI.Graphics;

    public script:XTask;

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
        super.afterSetup (__params);

        this.createSprites ();

        var __sprite:PIXI.Sprite = new PIXI.Sprite ();
        this.graphics = new PIXI.Graphics ();
        __sprite.addChild (this.graphics);
		this.addSortableChild (__sprite, this.getLayer (), this.getDepth (), true);

        this.script = this.addEmptyTask ();

		this.Idle_Script ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.show ();
    }

//------------------------------------------------------------------------------------------
	public clearGraphics ():void {
		this.graphics.clear ();
	}

//------------------------------------------------------------------------------------------
	public getGraphics ():PIXI.Graphics {
		return this.graphics;
	}

//------------------------------------------------------------------------------------------
	public drawForceVector (__color:number, __x1:number, __y1:number, __x2:number, __y2:number):void {
		this.graphics.lineStyle (6.0, __color);
		this.graphics.moveTo (__x1, __y1);
		this.graphics.lineTo (__x2, __y2);
	}

	//------------------------------------------------------------------------------------------
	public drawForceVectorDashed (
			__startColor:number, __endColor:number,
			__x1:number, __y1:number, __x2:number, __y2:number,
			__dashLength:number = 32, __gapLength:number = 16,
			__thickness:number = 6.0
		):void {

		var __color:number = __startColor;

		var __dx:number = (__x2 - __x1);
		var __dy:number = (__y2 - __y1);

		var __angle = Math.atan2 (__dy, __dx);

		this.graphics.lineStyle (__thickness, __color);
		this.graphics.moveTo (__x1, __y1);

		var __dist:number = Math.sqrt (__dx * __dx + __dy * __dy);

		var __x:number = __x1;
		var __y:number = __y1;

		var __dashDX = Math.cos (__angle) * __dashLength;
		var __dashDY = Math.sin (__angle) * __dashLength;
	
		var __gapDX = Math.cos (__angle) * __gapLength;
		var __gapDY = Math.sin (__angle) * __gapLength;

		var i:number;

		var __steps:number = Math.floor (__dist / (__dashLength + __gapLength)) + 1;

		var __colors:Array<number> = this.computeGradient (__startColor, __endColor, __steps);

		for (i=0; i < __steps; i++) {
			this.graphics.lineStyle (__thickness, __colors[i]);

			if (i == __steps - 1) {
				this.graphics.lineTo (__x + Math.cos (__angle) * __dashLength/2, __y + Math.sin (__angle) * __dashLength/2);
			} else {
				this.graphics.lineTo (__x + __dashDX, __y + __dashDY);
			}
			__x += __dashDX;
			__y += __dashDY;

			this.graphics.lineStyle (__thickness, 0x000000);
			this.graphics.moveTo (__x + __gapDX, __y + __gapDY);

			__x += __gapDX;
			__y += __gapDY
		}
	}

//------------------------------------------------------------------------------------------
	public computeGradient (__startColor:number, __endColor:number, __steps:number):Array<number> {
		var __colors:Array<number> = new Array<number> ();
		var __r1:number, __g1:number, __b1:number;
		var __r2:number, __g2:number, __b2:number;

		__r1 = (__startColor >> 16) & 255;
		__g1 = (__startColor >> 8) & 255;
		__b1 = (__startColor) & 255;

		__r2 = (__endColor >> 16) & 255;
		__g2 = (__endColor >> 8) & 255;
		__b2 = (__endColor) & 255;

		var __r_delta:number = (__r2 - __r1) / __steps;
		var __g_delta:number = (__g2 - __g1) / __steps;
		var __b_delta:number = (__b2 - __b1) / __steps;

		var i:number;

		for (i = 0; i < __steps; i++) {
			__colors.push ((__r1 << 16) + (__g1 << 8) + (__b1));

			__r1 += __r_delta;
			__g1 += __g_delta;
			__b1 += __b_delta;
		}

		return __colors;
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