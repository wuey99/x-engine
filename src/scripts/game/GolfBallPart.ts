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
import { EnemyX } from '../test/EnemyX';
import { TerrainContainer } from '../terrain/TerrainContainer';
import * as Matter from 'matter-js';
import { Reticle } from './Reticle';
import { GolfGame } from '../game/GolfGame';
import { GolfGameInstance } from '../game/GolfGameInstance';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class GolfBallPart extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;

    public script:XTask;

    public m_terrainContainer:TerrainContainer;
    public m_frame:number;
    public m_rotationSpeed:number;

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

		this.m_terrainContainer = __params[0];
        this.m_vel.x = __params[1];
        this.m_vel.y = __params[2];
        this.m_frame = __params[3];

        this.m_rotationSpeed = Math.random () * 24 - 12;

		this.setCX (-16, +16, -16, +16);
        
        this.script = this.addEmptyTask ();

        this.createSprites ();

        this.scale.x = this.scale.y = 1.5;

        this.Spin_Script ();
		
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
    public createSprites ():void {
		this.m_sprite = this.createAnimatedSprite ("GolfBall");
		this.addSortableChild (this.m_sprite, GolfGame.PLAYFIELD_FRONT_LAYER, GolfGame.PLAYFIELD_FRONT_DEPTH + 1.0, false);
        this.m_sprite.gotoAndStop (this.m_frame + 2);

		this.show ();
	}

	//------------------------------------------------------------------------------------------
	public Spin_Script ():void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

                        () => {
                            this.angle += this.m_rotationSpeed;
                            
                            this.x += this.vel.x;
                            this.y += this.vel.y;
                        },

					    XTask.GOTO, "loop",
						
					XTask.RETN,
                ]);	
                
				this.script.addTask ([
                    XTask.WAIT1000, 2 * 1000,

					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

                        XTask.FLAGS, (__task:XTask) => {
                            this.alpha = Math.max (0.0, this.alpha - 0.0125);

                            __task.ifTrue (this.alpha == 0.0);
                        }, XTask.BNE, "loop",

                        () => {
                            this.nukeLater ();
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