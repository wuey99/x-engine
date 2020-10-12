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

//------------------------------------------------------------------------------------------
export class TerrainTileIcon extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public x_sprite:XDepthSprite;
	
	public m_name:string;
	public m_size:number;
	public m_terrain:string;
	public m_frame:number;

	public static MAX_ICONS:number = 21;

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

		this.createSprites ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
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
    public createSprites ():void {
		this.m_sprite = this.createAnimatedSprite (this.m_name + this.m_size + "x" + this.m_size +  "_" + this.m_terrain);
		this.addSortableChild (this.m_sprite, 0, 0.0, true);
		this.m_sprite.gotoAndStop (this.m_frame);

		this.m_sprite.interactive = true;
		this.m_sprite.interactiveChildren = true;

        this.m_sprite.on ("mousedown", (e:PIXI.InteractionEvent) => {
            var __interactionData:PIXI.InteractionData = e.data;

            var __point:PIXI.Point = new PIXI.Point ();

            console.log (": mouseDown: ", this.m_frame, __interactionData.getLocalPosition (this, __point, __interactionData.global));

           this.fireMouseDownSignal (e);
		});

        this.show ();
    }

//------------------------------------------------------------------------------------------
}