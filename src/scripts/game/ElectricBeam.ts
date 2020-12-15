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
import { GolfGame } from './GolfGame';

//------------------------------------------------------------------------------------------
export class ElectricBeam extends XGameObject {
    public m_sprite:PIXI.Sprite;
    public x_sprite:PIXI.DisplayObject;

	public m_terrainContainer:TerrainContainer;
    public m_worldName:string;

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

		this.m_terrainContainer = __params[0];
        this.m_worldName = __params[1];
        
        this.script = this.addEmptyTask ();

        this.createSprites ();

        this.Idle_Script ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite ("Common_Sprites_ElectricBeam");
        this.x_sprite = this.addSpriteAsChild (this.m_sprite, -16, 0, GolfGame.PLAYFIELD_BEHIND_LAYER, GolfGame.PLAYFIELD_BEHIND_DEPTH, false);

        this.show ();
    }

//------------------------------------------------------------------------------------------
    public fadeOut ():void {
        this.addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,

                () => {
                    this.alpha = Math.max (0.0, this.alpha - 0.033);
                }, 
                
                XTask.GOTO, "loop",

            XTask.RETN,
        ]);
    }

//------------------------------------------------------------------------------------------
	public Idle_Script ():void {
        var __scaleX:number = 1.0;
        var __scaleY:number = 0;
        var __flipX:number = 1.0;

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
                        XTask.WAIT, 0x0100,
                        
                        XTask.FLAGS, (__task:XTask) => {
                            __scaleY = Math.min (1.0, __scaleY + 0.033);

                            __task.ifTrue (__scaleY == 1.0);
                        }, XTask.BNE, "loop",

                    XTask.LABEL, "pulse",
                        XTask.LOOP, 16,
                            () => {
                                __scaleY -= 0.0066;
                            }, XTask.WAIT, 0x0100,
                        XTask.NEXT,

                        XTask.LOOP, 16,
                            () => {
                                __scaleY += 0.0066;
                            }, XTask.WAIT, 0x0100,
                        XTask.NEXT,

					    XTask.GOTO, "pulse",
						
					XTask.RETN,
                ]);	
                
                this.script.addTask ([
                    XTask.LABEL, "loop",
                        () => {
                            __flipX = -1.0;
                        }, XTask.WAIT, 0x0600,

                        () => {
                            __flipX = +1.0;
                        }, XTask.WAIT, 0x0600,

                        XTask.GOTO, "loop",

                    XTask.RETN,
                ]);

                this.script.addTask ([
                    XTask.LABEL, "loop",
                        XTask.LOOP, 16,
                            () => {
                                __scaleX -= 0.05;
                            }, XTask.WAIT, 0x0100,
                        XTask.NEXT,

                        XTask.LOOP, 16,
                            () => {
                                __scaleX += 0.05;
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
                        this.x_sprite.scale.x = __scaleX * __flipX;
                        this.x_sprite.scale.y = __scaleY;
                    },

				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
}