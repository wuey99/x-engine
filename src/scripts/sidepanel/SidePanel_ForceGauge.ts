//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
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
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { SidePanel_ForceNeedle } from './SidePanel_ForceNeedle';
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class SidePanel_ForceGauge extends XGameObject {
    public m_sprite:PIXI.Sprite;

    public m_forceNeedle:SidePanel_ForceNeedle;

    public m_worldName:string;

    public m_forceText:PIXI.BitmapText;
    public m_label:PIXI.BitmapText;

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

        this.m_forceText.text = Math.min (10, Math.floor (__value/20 + 1)) + "kN";
        
        this.m_forceText.x = -this.m_forceText.width/2
    }

//------------------------------------------------------------------------------------------
    public updateLabel ():void {
        this.m_label.text = G.main.getTranslation ("force");
        this.m_label.x = -this.m_label.width/2;
    }

//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_ForceGauge");
        this.addSpriteAsChild (this.m_sprite, -140/2, -130/2, this.getLayer (), this.getDepth (), false);

       this.m_forceNeedle = this.addGameObjectAsChild (SidePanel_ForceNeedle, this.getLayer (), this.getDepth () + 1.0, false) as SidePanel_ForceNeedle;
       this.m_forceNeedle.afterSetup ([this.m_worldName]);
       this.m_forceNeedle.y = 16;

        this.createBitmapFont (
            "GaugeFont",
            {
    	        fontFamily: "Nunito",
                fontSize: 36,
                strokeThickness: 0,
                fill: "0x58bf8f",             
            },
            {chars: this.getBitmapFontChars ()}
        );

        var __force:PIXI.BitmapText = this.m_forceText = new PIXI.BitmapText ("50 kN", { fontName: "GravityFont" });
        this.addSortableChild (__force, this.getLayer (), this.getDepth () + 1.0, false);
        __force.x = -__force.width/2;
        __force.y = 80;

        var __label:PIXI.BitmapText = this.m_label = new PIXI.BitmapText (G.main.getTranslation ("force"), { fontName: "SidePanelSmallLabelFont" });
        this.addSortableChild (__label, this.getLayer (), this.getDepth () + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 128;

        this.show ();
    }

//------------------------------------------------------------------------------------------
}