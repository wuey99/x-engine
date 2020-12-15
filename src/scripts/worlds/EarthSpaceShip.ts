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
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class EarthSpaceShip extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;

    public script:XTask;

    public static spaceShipNames:Array<string> = [
        "Earth_Sprites_Spaceship001",
        "Earth_Sprites_Spaceship002",
        "Earth_Sprites_Spaceship003",
        "Earth_Sprites_Spaceship004",
    ];

    public m_spriteName:string;

    public m_baseScale:number;

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

        this.m_baseScale = 1.0;

        this.setupSpaceShip ();

        this.createSprites ();

        this.script = this.addEmptyTask ();

        this.Move_Script ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------
    public setupSpaceShip ():void {
        this.m_spriteName = EarthSpaceShip.spaceShipNames[Math.floor (Math.random () * EarthSpaceShip.spaceShipNames.length)];

        if (Math.random () > 0.50) {
            this.x = -256;
            this.m_vel.x = +4;
            this.m_vel.y = 0;
        } else {
            this.x = G.SCREEN_WIDTH + 256;
            this.m_vel.x = -4;
            this.m_vel.y = 0;
        }

        this.x = G.SCREEN_WIDTH / 2;
        this.y = G.SCREEN_HEIGHT / 2 + Math.random () * G.SCREEN_HEIGHT / 2;
    }

//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createAnimatedSprite (this.m_spriteName);
        this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);
    
        this.show ();
    }

    //------------------------------------------------------------------------------------------
    public setBaseScale (__scale:number):void {
        this.m_baseScale = __scale;
    }
    
    //------------------------------------------------------------------------------------------
    public adjustScale (__scaleX:number, __scaleY:number):void {
        this.scale.x = this.m_baseScale * __scaleX;
        this.scale.y = this.m_baseScale * __scaleY;
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
                                this.x += this.m_vel.x;

                                if ((this.m_vel.x < 0 && this.x < 256) || (this.m_vel.x > 0 && this.x > G.SCREEN_WIDTH + 256)) {
                                    this.nukeLater ();
                                }
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