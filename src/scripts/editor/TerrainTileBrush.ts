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
import { XPoint } from '../../engine/geom/XPoint';
import { XRect } from '../../engine/geom/XRect';
import { TerrainContainer } from '../terrain/TerrainContainer';

//------------------------------------------------------------------------------------------
export class TerrainTileBrush extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public x_sprite:XDepthSprite;
    
    public m_name:string;
	public m_size:number;
	public m_world:string;
	public m_frame:number;

    public script:XTask;

    public m_droppedSignal:XSignal;

    public m_terrainContainer:TerrainContainer;
    
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
        this.m_name = __params[1] as string;
		this.m_size = __params[2] as number;
		this.m_world = __params[3] as string;
		this.m_frame = __params[4] as number;

        this.m_droppedSignal = this.createXSignal ();

		this.createSprites ();

        this.script = this.addEmptyTask ();

        this.Idle_Script ();

        this.addTask ([
            XTask.WAIT, 0x0800,

            () => {
                this.m_XApp.getStage ().on ("mousedown", this.dropTile.bind (this));
            },

            XTask.RETN,
        ]);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();

        this.m_XApp.getStage ().off ("mousedown", this.dropTile.bind (this));
	}
   
//------------------------------------------------------------------------------------------
    public getName ():string {
        return this.m_name;
    }

//------------------------------------------------------------------------------------------
    public getSize ():number {
        return this.m_size;
    }

//------------------------------------------------------------------------------------------
    public getWorld ():string {
        return this.m_world;
    }

//------------------------------------------------------------------------------------------
    public getFrame ():number {
        return this.m_frame;
    }

//------------------------------------------------------------------------------------------
    public dropTile (e:PIXI.InteractionEvent):void {
        this.m_droppedSignal.fireSignal ();
    }

//------------------------------------------------------------------------------------------
    public addDroppedListener (__listener:any):number {
        return this.m_droppedSignal.addListener (__listener);
    }

//------------------------------------------------------------------------------------------
    public createSprites ():void {
		this.m_sprite = this.createAnimatedSprite (this.m_world + "_" + this.m_name + this.m_size + "x" + this.m_size);
		this.addSortableChild (this.m_sprite, 0, 0.0, true);
        this.m_sprite.gotoAndStop (this.m_frame);
        
        console.log (": TerrainTileBrush: ", this.m_size, this.m_world, this.m_frame);

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
                        
                        () => {   
                            var __point:XPoint = this.m_terrainContainer.getMousePos ();

                            this.x = __point.x & 0xfffffff0;
                            this.y = __point.y & 0xfffffff0;
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