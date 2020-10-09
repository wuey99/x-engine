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

		this.m_size = __params[0] as number;
		this.m_terrain = __params[1] as string;
		this.m_frame = __params[2] as number;

		this.createSprites ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
		this.m_sprite = this.createAnimatedSprite ("Terrain" + this.m_size + "x" + this.m_size +  "_" + this.m_terrain);
		this.addSortableChild (this.m_sprite, 0, 0.0, true);
		this.m_sprite.gotoAndStop (this.m_frame);

		this.m_sprite.interactive = true;
		this.m_sprite.interactiveChildren = true;

        this.m_sprite.on ("mousedown", (e:PIXI.InteractionEvent) => {
			console.log (": mouseDown: ", this.m_frame, e.data, e.data.global);
		});

        this.show ();
    }

//------------------------------------------------------------------------------------------
}