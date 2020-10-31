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
import { SidePanel_ForceNeedle } from './SidePanel_ForceNeedle';

//------------------------------------------------------------------------------------------
export class SidePanel_ForceGauge extends XGameObject {
    public m_sprite:PIXI.Sprite;
    public x_sprite:XDepthSprite;

    public m_forceNeedle:SidePanel_ForceNeedle;

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
    public setForce (__value:number):void {
        __value = Math.min (200.0, __value);

        this.m_forceNeedle.angle = __value - 67.5;
    }

//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_ForceGauge");
        this.addSpriteAsChild (this.m_sprite, -140/2, -130/2, 0, 999999.0, false);

       this.m_forceNeedle = this.addGameObjectAsChild (SidePanel_ForceNeedle, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_ForceNeedle;
       this.m_forceNeedle.afterSetup ([this.m_worldName]);
       this.m_forceNeedle.y = 16;

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