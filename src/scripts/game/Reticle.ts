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
import { GolfGame } from './GolfGame';

//------------------------------------------------------------------------------------------
export class Reticle extends XGameObject {
    public m_sprite:PIXI.Sprite;

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
        this.m_sprite = this.createSprite ("Common_Sprites_Reticle");
        this.addSpriteAsChild (this.m_sprite, -236, -236, this.getLayer (), this.getDepth (), false);

        this.show ();
    }

	//------------------------------------------------------------------------------------------
	public Idle_Script ():void {
		var __alpha:number = 1.0;

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LOOP, 4,
						XTask.LOOP, 10,
							() => {
								__alpha = Math.max (0.25, __alpha - 0.05);
							}, XTask.WAIT, 0x0200,
						XTask.NEXT,
							
						XTask.LOOP, 10,
							() => {
								__alpha = Math.min (1.0, __alpha + 0.05);
							}, XTask.WAIT, 0x0200,
						XTask.NEXT,
					XTask.NEXT,

					XTask.LOOP, 20,
						() => {
							__alpha = Math.max (0.0, __alpha - 0.05);
						}, XTask.WAIT, 0x0200,
					XTask.NEXT,

					() => {
						this.nukeLater ();
					},

					XTask.WAIT, 0x0100,

					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					() => {
						this.m_sprite.alpha = __alpha;
					},

				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }
        
//------------------------------------------------------------------------------------------
}