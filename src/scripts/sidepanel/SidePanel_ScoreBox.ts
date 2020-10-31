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

//------------------------------------------------------------------------------------------
export class SidePanel_ScoreBox extends XGameObject {
    public m_sprite:PIXI.Sprite;
    public x_sprite:XDepthSprite;

    public m_score:number;

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

        this.m_score = 0;

        this.createSprites ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_ScoreBox");
        this.addSpriteAsChild (this.m_sprite, -204/2, -176/2, 0, 999999.0, true);

		PIXI.BitmapFont.from ("ScoreFont", {
			fontFamily: "Arial",
			fontSize: 60,
			strokeThickness: 0,
			fill: "0x58bf8f"
        });
        
        var __score:PIXI.BitmapText = new PIXI.BitmapText ("" + this.m_score,  { fontName: "ScoreFont" });
        this.addSortableChild (__score, 0, 999999.0 + 1.0, false);
        __score.x = -__score.width/2;
        __score.y = -64;

		var __label:PIXI.BitmapText = new PIXI.BitmapText ("Score", { fontName: "SidePanelLabelFont" });
        this.addSortableChild (__label, 0, 999999.0 + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 16;

        this.show ();
    }

//------------------------------------------------------------------------------------------
}