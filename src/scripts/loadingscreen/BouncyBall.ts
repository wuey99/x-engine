//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
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
import { timeStamp } from 'console';

//------------------------------------------------------------------------------------------
export class BouncyBall extends XGameObject {
    public m_sprite:PIXI.Sprite;

    public script:XTask;

    public m_targetX:number;
    public m_realTargetX:number;
	public m_baseY:number;

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

		this.m_vel.x = 0;
		this.m_vel.y = 0;

		this.addTask ([
			XTask.WAIT, 0x0100,

			() => {
                this.m_targetX = this.x;
                this.m_realTargetX = this.x;
				this.m_baseY = this.y;
				this.m_vel.x = 1.0;
				this.m_vel.y = -20.0;

				this.Idle_Script ();
			},

			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				() => {
					this.m_vel.y = Math.min (16.0, this.m_vel.y + 1.0);
				},

				XTask.GOTO, "loop",
			XTask.RETN,
		]);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite ("DefaultBall");
        this.addSpriteAsChild (this.m_sprite, -42/2, -42/2, this.getLayer (), this.getDepth ());

        this.show ();
    }

	//------------------------------------------------------------------------------------------
	public setTargetX (__targetX:number):void {
		this.m_targetX = __targetX;
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
						
						XTask.FLAGS, (__task:XTask) => {
							if (this.x < this.m_realTargetX) {
								this.x += this.m_vel.x;

								if (this.x > this.m_targetX) {
									this.x = this.m_targetX
								}
							}

							this.y += this.m_vel.y;

							if (this.y > this.m_baseY) {
								this.y = this.m_baseY;

								this.m_vel.x = (this.m_targetX - this.x) / 60;
								this.m_vel.y = -20.0;
								this.m_realTargetX = this.m_targetX;

								__task.ifTrue (true);
							} else {
								__task.ifTrue (false);
							}
						}, XTask.BNE, "loop",

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