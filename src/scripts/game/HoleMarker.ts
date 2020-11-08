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
import { timeStamp } from 'console';
import { GolfGameInstance } from '../game/GolfGameInstance';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class HoleMarker extends XGameObject {
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

		this.setCX (-16, +16, -16, +16);

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
        this.m_sprite = this.createAnimatedSprite ("HoleMarker");
        this.addSortableChild (this.m_sprite, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, false);

        this.show ();
    }

//------------------------------------------------------------------------------------------
	public setCollisions ():void {
		(G.appX as GolfGameInstance).getHoleCollisionList ().addCollision (this.getLayer (), this, this.getPos (), this.getCX ());
	}

//------------------------------------------------------------------------------------------
	public Idle_Script ():void {
        var __scale:number = 0.66;

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
                        XTask.LOOP, 16,
                            () => {
                                __scale += 0.033;

                                this.m_sprite.scale.x = this.m_sprite.scale.y = __scale;
                            }, 
                            
                            XTask.WAIT, 0x0100,
                        XTask.NEXT,

                        XTask.LOOP, 16,
                            () => {
                                __scale -= 0.033;

                                this.m_sprite.scale.x = this.m_sprite.scale.y = __scale;
                            }, 
                            
                            XTask.WAIT, 0x0100,
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
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }

//------------------------------------------------------------------------------------------
}