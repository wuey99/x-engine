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
export class SidePanel_Planet extends XGameObject {
    public m_sprite:PIXI.Sprite;
    public x_sprite:XDepthSprite;

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

        this.createSprites ();
        
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite ("Earth_Sprites_Planet");
        this.addSpriteAsChild (this.m_sprite, -108/2, -110/2, 0, 999999.0, false);

		PIXI.BitmapFont.from("GravityFont", {
			fontFamily: "Arial",
			fontSize: 36,
			strokeThickness: 0,
			fill: "green"
        });
        
        var __gravity:PIXI.BitmapText = new PIXI.BitmapText ("9_8 m_s",  { fontName: "GravityFont" });
        this.addSortableChild (__gravity, 0, 999999.0 + 1.0, false);
        __gravity.x = -__gravity.width/2;
        __gravity.y = 80;

        var __label:PIXI.BitmapText = new PIXI.BitmapText ("Earth's Gravity ",  { fontName: "SidePanelSmallLabelFont" });
        this.addSortableChild (__label, 0, 999999.0 + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 128;

        this.show ();
    }

//------------------------------------------------------------------------------------------
}