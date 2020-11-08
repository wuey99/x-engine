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
import { GolfGameInstance } from './GolfGameInstance';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class RangeBorder extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;

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

        var __left:number = __params[1];
        var __right:number = __params[2];

        this.setCX (__left, __right, -32768, +32768);

		this.m_terrainContainer = __params[0];
        
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
        this.m_sprite = this.createAnimatedSprite ("RangeBorder");
        this.addSortableChild (this.m_sprite, 0, 999999.0, false);

        this.show ();
    }

//------------------------------------------------------------------------------------------
    public setCollisions ():void {
        (G.appX as GolfGameInstance).getBorderCollisionList ().addCollision (this.getLayer (), this, this.getPos (), this.getCX ());
    }

//------------------------------------------------------------------------------------------
	public Idle_Script ():void {

        var __scaleX:number = 1.0;

        this.m_sprite.scale.y = 4.0;

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
                        XTask.LOOP, 16,
                            () => {
                                __scaleX += 0.066;
                            }, XTask.WAIT, 0x0100,
                        XTask.NEXT,
                        
                        XTask.LOOP, 16,
                            () => {
                                __scaleX -= 0.066;
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
                        this.m_sprite.scale.x = __scaleX;
                    },

				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
}