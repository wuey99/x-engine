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
    public m_sprite:PIXI.Sprite;
    public x_sprite:XDepthSprite;

    public m_needleSprite:PIXI.Sprite;
    public x_needleSprite:XDepthSprite;

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
        
        this.createSprites ();
        
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_ForceGauge");
        this.addSpriteAsChild (this.m_sprite, -140/2, -130/2, 0, 999999.0, false);

        this.m_needleSprite = this.createSprite (this.m_worldName + "_Sprites_ForceNeedle");
        this.addSpriteAsChild (this.m_needleSprite, -29, -96, 0, 999999.0 + 1.0, false).y = 8;

		PIXI.BitmapFont.from ("GaugeFont", {
			fontFamily: "Arial",
			fontSize: 36,
			strokeThickness: 0,
			fill: "0x58bf8f"
        });
        
        var __force:PIXI.BitmapText = new PIXI.BitmapText ("50 N", { fontName: "GravityFont" });
        this.addSortableChild (__force, 0, 999999.0 + 1.0, false);
        __force.x = -__force.width/2;
        __force.y = 80;

        var __label:PIXI.BitmapText = new PIXI.BitmapText ("Hit Force", { fontName: "SidePanelSmallLabelFont" });
        this.addSortableChild (__label, 0, 999999.0 + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 128;

        this.show ();
    }

//------------------------------------------------------------------------------------------
}