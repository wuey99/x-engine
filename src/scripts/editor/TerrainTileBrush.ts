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
import { XPoint } from '../geom/XPoint';
import { XRect } from '../geom/XRect';

//------------------------------------------------------------------------------------------
export class TerrainTileBrush extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public x_sprite:XDepthSprite;
    
    public m_name:string;
	public m_size:number;
	public m_terrain:string;
	public m_frame:number;

    public script:XTask;

    public m_droppedSignal:XSignal;

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

        this.m_name = __params[0] as string;
		this.m_size = __params[1] as number;
		this.m_terrain = __params[2] as string;
		this.m_frame = __params[3] as number;

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
    public getTerrain ():string {
        return this.m_terrain;
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
		this.m_sprite = this.createAnimatedSprite (this.m_name + this.m_size + "x" + this.m_size +  "_" + this.m_terrain);
		this.addSortableChild (this.m_sprite, 0, 0.0, true);
        this.m_sprite.gotoAndStop (this.m_frame);
        
        console.log (": TerrainTileBrush: ", this.m_size, this.m_terrain, this.m_frame);

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
                            var __point:XPoint = this.m_XApp.getMousePos ();

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