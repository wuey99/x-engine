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
import { GolfGameInstance } from './GolfGameInstance';
import { G } from '../../engine/app/G';
import { GolfGame } from './GolfGame';

//------------------------------------------------------------------------------------------
export class HorizontalBorder extends XGameObject {
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

        var __top:number = __params[1];
        var __bottom:number = __params[2];

        this.setCX (-32768, +32768, __top, __bottom);

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
        this.m_sprite = this.createAnimatedSprite ("HorizontalBorder");
        this.addSortableChild (this.m_sprite, GolfGame.PLAYFIELD_FRONT_LAYER, GolfGame.PLAYFIELD_FRONT_DEPTH, false);
        this.scale.x = 6.0;
        
        this.show ();
    }

//------------------------------------------------------------------------------------------
    public setCollisions ():void {
        (G.appX as GolfGameInstance).getBorderCollisionList ().addCollision (0, this, this.getPos (), this.getCX ());
    }

//------------------------------------------------------------------------------------------
	public Idle_Script ():void {

        var __scaleY:number = 1.0;

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
                                __scaleY += 0.066;
                            }, XTask.WAIT, 0x0100,
                        XTask.NEXT,
                        
                        XTask.LOOP, 16,
                            () => {
                                __scaleY -= 0.066;
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
                    },

				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
}