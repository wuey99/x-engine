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
import { TerrainContainer } from '../terrain/TerrainContainer';
import { GolfGame } from '../game/GolfGame';
import { GolfBall } from './GolfBall';

//------------------------------------------------------------------------------------------
export class BallFire extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public m_innerSprite:PIXI.AnimatedSprite;

    public m_golfBall:GolfBall;

    public script:XTask;
    public pulse:XTask;
    
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

        this.m_golfBall = __params[0];

        this.alpha = 0.0;

        this.script = this.addEmptyTask ();
        this.pulse = this.addEmptyTask ();

        this.createSprites ();
        
        this.Idle_Script ();
        this.Pulse_Script ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createAnimatedSprite ("BallFire");
        this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth () - 2.0, false);

        this.m_innerSprite = this.createAnimatedSprite ("BallFireInner");
        this.addSortableChild (this.m_innerSprite, this.getLayer (), this.getDepth () - 1.0, false);

        this.show ();
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
                    () => {
                    },

                XTask.GOTO, "loop",
                
            XTask.RETN,
                
            //------------------------------------------------------------------------------------------			
        ]);
            
    //------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
	public OnFire_Script ():void {
        var __scale:number = 0.0;
        var __alpha:number = 0;

        //------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
                this.script.addTask ([
                    XTask.LABEL, "wait",
                        XTask.WAIT, 0x0100,
        
                        XTask.FLAGS, (__task:XTask) => {
                            __task.ifTrue (this.m_golfBall.getMatterBody ().speed > 16.0);
                        }, XTask.BNE, "wait",
    
                    () => {
                        __scale = 0.66;
                        __alpha = 0.75;            
                    },

                    XTask.LABEL, "loop",
                        XTask.WAIT, 0x0100,
        
                        XTask.FLAGS, (__task:XTask) => {
                            __scale = Math.min (1.25, __scale + 0.033);
        
                            __task.ifTrue (__scale == 1.25);
                        }, XTask.BNE, "loop",

                    XTask.WAIT1000, 0.50 * 1000,

                    XTask.LABEL, "decay",
                        XTask.WAIT, 0x0100,
            
                        XTask.FLAGS, (__task:XTask) => {
                            __alpha = Math.max (0.0, __alpha - 0.066);
        
                            __task.ifTrue (__alpha == 0);
                        }, XTask.BNE, "decay",  
                        
                    XTask.RETN,
                ]);
            },
            
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					() => {
                        this.scale.x = this.scale.y = __scale;
                        this.alpha = __alpha;
                    },

				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
    public Pulse_Script ():void {
        var __scaleY:number = 1.0;

        this.pulse.gotoTask ([
                
            //------------------------------------------------------------------------------------------
            // control
            //------------------------------------------------------------------------------------------
            () => {
                this.pulse.addTask ([
                    XTask.LABEL, "loop",
                        XTask.LOOP, 16,
                            () => {
                                __scaleY += 0.025;
                            }, XTask.WAIT, 0x0100,
                        XTask.NEXT,

                        XTask.LOOP, 16,
                            () => {
                                __scaleY -= 0.025;
                            }, XTask.WAIT, 0x0100,
                        XTask.NEXT,

                        XTask.GOTO, "loop",

                    XTask.RETN,
                ]);
            },
            
            //------------------------------------------------------------------------------------------
            // animation
            //------------------------------------------------------------------------------------------	
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                    () => {    
                        this.m_sprite.scale.y = __scaleY;
                        this.m_innerSprite.scale.y = __scaleY;
                    },

                XTask.GOTO, "loop",
                
            XTask.RETN,
                
            //------------------------------------------------------------------------------------------			
        ]);
            
    //------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
}