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
export class SidePanel_Mass extends XGameObject {
    public m_sprite:PIXI.Sprite;
    public x_sprite:XDepthSprite;

    public m_massValue:number;

    public m_worldName:string;
    
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

        this.m_worldName = __params[0];

        this.m_massValue = 1;

        this.createSprites ();
        
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_Mass");
        this.addSpriteAsChild (this.m_sprite, -68/2, -68/2, 0, 999999.0, false);

		PIXI.BitmapFont.from("MassFont", {
			fontFamily: "Arial",
			fontSize: 36,
			strokeThickness: 0,
			fill: "green"
        });
        
        var __mass:PIXI.BitmapText = new PIXI.BitmapText (this.m_massValue + "kg",  { fontName: "MassFont" });
        this.addSortableChild (__mass, 0, 999999.0 + 1.0, false);
        __mass.x = -__mass.width/2;
        __mass.y = 48;

        var __label:PIXI.BitmapText = new PIXI.BitmapText ("Mass",  { fontName: "SidePanelLabelFont" });
        this.addSortableChild (__label, 0, 999999.0 + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 96;

        this.show ();
    }

//------------------------------------------------------------------------------------------
}