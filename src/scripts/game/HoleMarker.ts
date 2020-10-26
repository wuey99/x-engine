//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/Xtype';
import { XGameObject} from '../gameobject/XGameObject';
import { TerrainContainer } from '../terrain/TerrainContainer';

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
        this.addSortableChild (this.m_sprite);

        this.show ();
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