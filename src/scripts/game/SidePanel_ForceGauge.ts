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
export class SidePanel_ForceGauge extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public x_sprite:XDepthSprite;

    public m_needleSprite:PIXI.AnimatedSprite;
    public x_needleSprite:XDepthSprite;

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
        this.m_sprite = this.createAnimatedSprite ("Earth_Sprites_ForceGauge");
        this.addSortableChild (this.m_sprite, 0, 999999.0, false);

        this.m_needleSprite = this.createAnimatedSprite ("Earth_Sprites_ForceNeedle");
        this.addSortableChild (this.m_needleSprite, 0, 999999.0 + 1.0, false);

		PIXI.BitmapFont.from("GaugeFont", {
			fontFamily: "Arial",
			fontSize: 18,
			strokeThickness: 0,
			fill: "green"
        });
        
        var __force:PIXI.BitmapText = new PIXI.BitmapText ("50 N",  { fontName: "GravityFont" });
        this.addSortableChild (__force, 0, 999999.0 + 1.0, false);
        __force.x = -__force.width/2;
        __force.y = 40;

        var __label:PIXI.BitmapText = new PIXI.BitmapText ("Hit Force",  { fontName: "SidePanelSmallLabelFont" });
        this.addSortableChild (__label, 0, 999999.0 + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 64;

        this.show ();
    }

//------------------------------------------------------------------------------------------
}