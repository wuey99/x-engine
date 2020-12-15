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
export class SidePanel_Planet extends XGameObject {
    public m_sprite:PIXI.Sprite;


    public m_worldName:string;
    public m_realWorldName:string;
    public m_worldGravity:number;

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
        this.m_realWorldName = __params[1];
        this.m_worldGravity = __params[2];

        this.createSprites ();
        
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public updateLabel ():void {
        this.m_label.text = this.getPlanetGravity ();
        this.m_label.x = -this.m_label.width/2;
    }

//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_Planet");
        this.addSpriteAsChild (this.m_sprite, -108/2, -110/2, this.getLayer (), this.getDepth (), false);

        this.createBitmapFont (
            "GravityFont",
            {
                fontFamily: "Nunito",
                fontSize: 36,
                strokeThickness: 0,
                fill: "0x58bf8f",              
            },
            {chars: this.getBitmapFontChars ()}
        );

        var __gravity:PIXI.BitmapText = new PIXI.BitmapText (this.m_worldGravity + " m/s",  { fontName: "GravityFont" });
        this.addSortableChild (__gravity, this.getLayer (), this.getDepth () + 1.0, false);
        __gravity.x = -__gravity.width/2 - 8;
        __gravity.y = 80;

        var __gravity2:PIXI.BitmapText = new PIXI.BitmapText ("2",  { fontName: "GravityFont", fontSize: 28 });
        this.addSortableChild (__gravity2, this.getLayer (), this.getDepth () + 1.0, false);
        __gravity2.x = __gravity.x + __gravity.width;
        __gravity2.y = 80;
        
        var __label:PIXI.BitmapText = this.m_label = new PIXI.BitmapText (
            this.getPlanetGravity (),
            { fontName: "SidePanelSmallLabelFont" }
        );
        this.addSortableChild (__label, this.getLayer (), this.getDepth () + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 128;

        this.show ();
    }

//------------------------------------------------------------------------------------------
    public getPlanetGravity ():string {
        var __s:string =  this.m_realWorldName.endsWith ("s") ? "' " : "'s ";

        return this.m_realWorldName +
        __s + 
         G.main.getTranslation ("gravity") + " "
    }

//------------------------------------------------------------------------------------------
}