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
import { XPoint } from '../../engine/geom/XPoint';
import { GolfGame } from './GolfGame';

//------------------------------------------------------------------------------------------
export class HoleArrow extends XGameObject {
    public m_sprite:PIXI.Sprite;

	public m_terrainContainer:TerrainContainer;
    public m_worldName:string;

    public script:XTask;
	
	public m_baseX:number;
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

		this.m_terrainContainer = __params[0];
        this.m_worldName = __params[1];
		
        this.script = this.addEmptyTask ();

        this.createSprites ();

        this.Idle_Script ();

		this.addTask ([
			XTask.WAIT, 0x0100,

			() => {
				this.m_baseX = this.x;
				this.m_baseY = this.y;
			},

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
        this.m_sprite = this.createSprite ("Common_Sprites_HoleArrow");
        this.addSpriteAsChild (this.m_sprite, -40/2, -42/2, GolfGame.PLAYFIELD_FRONT_LAYER, GolfGame.PLAYFIELD_FRONT_DEPTH, false);

        this.show ();
    }

//------------------------------------------------------------------------------------------
	public getBasePos ():XPoint {
		return new XPoint (this.m_baseX, this.m_baseY);
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
                        XTask.LOOP, 12,
                            () => { this.y += 2; }, XTask.WAIT, 0x0100,
                        XTask.NEXT,

                        XTask.LOOP, 12,
                            () => { this.y -= 2; }, XTask.WAIT, 0x0100,
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