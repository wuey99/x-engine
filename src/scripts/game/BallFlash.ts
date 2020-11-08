//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
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
import { XDepthSprite} from '../../engine/sprite/XDepthSprite';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { TerrainContainer } from '../terrain/TerrainContainer';
import { GolfGame } from '../game/GolfGame';

//------------------------------------------------------------------------------------------
export class BallFlash extends XGameObject {
    public m_sprite:PIXI.Sprite;
    public x_sprite:PIXI.Sprite;

	public m_terrainContainer:TerrainContainer;
    public m_imageName:string;

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
        this.m_imageName = __params[1];
        
        this.alpha = 0.90;

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
        this.m_sprite = this.createSprite (this.m_imageName);
        this.x_sprite = this.addSpriteAsChild (this.m_sprite, -64, -64, 0, 999999.0, false);

        this.show ();
    }

//------------------------------------------------------------------------------------------
	public Idle_Script ():void {
        var __scale:number = 0.50;

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
                this.script.addTask ([
                    XTask.LABEL, "loop",
                        () => {
                            __scale += 0.033;
                        }, XTask.WAIT, 0x0100,

                        XTask.GOTO, "loop",

                    XTask.RETN,
                ]);
			},
                
			() => {
                this.script.addTask ([
                    XTask.WAIT1000, 0.33 * 1000,

                    XTask.LABEL, "loop",
                        XTask.WAIT, 0x0100,

                        XTask.FLAGS, (__task:XTask) => {
                            this.alpha = Math.max (0.0, this.alpha - 0.0066);

                            __task.ifTrue (this.alpha == 0.0);
                        }, XTask.BNE, "loop",

                        () => {
                            this.nukeLater ();
                        },

                    XTask.RETN,
                ]);
            },
            
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					() => {
                        this.scale.x = __scale;
                        this.scale.y = __scale;
                    },

				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
}