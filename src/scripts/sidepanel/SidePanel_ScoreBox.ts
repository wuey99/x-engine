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
export class SidePanel_ScoreBox extends XGameObject {
    public m_sprite:PIXI.Sprite;

    public m_score:number;

    public m_worldName:string;
    
    public m_scoreText:PIXI.BitmapText;

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
        this.m_score = __params[1];

        this.createSprites ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public setScore (__score:number):void {
        this.m_scoreText.text = "" + __score;
    }

//------------------------------------------------------------------------------------------
public updateLabel ():void {
    this.m_label.text = G.main.getTranslation ("score");
    this.m_label.x = -this.m_label.width/2;
}

//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_ScoreBox");
        this.addSpriteAsChild (this.m_sprite, -204/2, -176/2, this.getLayer (), this.getDepth (), true);

       this.createBitmapFont (
            "ScoreFont",
            {
                fontFamily: "Nunito",
                fontSize: 60,
                strokeThickness: 0,
                fill: "0x58bf8f",         
            },
            {chars: this.getBitmapFontChars ()}
        );

        var __score:PIXI.BitmapText = this.m_scoreText = new PIXI.BitmapText ("" + this.m_score,  { fontName: "ScoreFont" });
        this.addSortableChild (__score, this.getLayer (), this.getDepth () + 1.0, false);
        __score.x = -__score.width/2;
        __score.y = -64;

		var __label:PIXI.BitmapText = this.m_label = new PIXI.BitmapText (G.main.getTranslation ("score"), { fontName: "SidePanelSmallLabelFont" });
        this.addSortableChild (__label, this.getLayer (), this.getDepth () + 1.0, false);
        __label.x = -__label.width/2;
        __label.y = 16;

        this.show ();
    }

//------------------------------------------------------------------------------------------
}