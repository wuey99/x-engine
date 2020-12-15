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
import { G } from '../../engine/app/G';

//------------------------------------------------------------------------------------------
export class SidePanel_Mass extends XGameObject {
    public m_sprite:PIXI.Sprite;

    public m_worldMass:number;

    public m_worldName:string;

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
        this.m_worldMass = __params[1];

        this.createSprites ();
        
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
        
    //------------------------------------------------------------------------------------------
    public updateLabel ():void {
        this.m_label.text = G.main.getTranslation ("mass");
        this.m_label.x = -this.m_label.width/2;
    }

//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_Mass");
        this.addSpriteAsChild (this.m_sprite, -68/2, -68/2, this.getLayer (), this.getDepth (), false);
        
        this.createBitmapFont (
            "MassFont",
            {
                fontFamily: "Nunito",
                fontSize: 36,
                strokeThickness: 0,
                fill: "0x58bf8f",           
            },
            {chars: this.getBitmapFontChars ()}
        );

        var __mass:PIXI.BitmapText = new PIXI.BitmapText (this.m_worldMass + " kg", { fontName: "MassFont" });
        this.addSortableChild (__mass, this.getLayer (), this.getDepth () + 1.0, false);
        __mass.x = -__mass.width/2;
        __mass.y = 48;

        var __label:PIXI.BitmapText = this.m_label = new PIXI.BitmapText (G.main.getTranslation ("mass"), { fontName: "SidePanelLabelFont" });
        this.addSortableChild (__label, this.getLayer (), this.getDepth () + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 96;

        this.show ();
    }

//------------------------------------------------------------------------------------------
}