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
export class SidePanel_ScoreBox extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public x_sprite:XDepthSprite;

    public m_score:number;

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
        this.m_sprite = this.createAnimatedSprite ("Earth_Sprites_ScoreBox");
        this.addSortableChild (this.m_sprite, 0, 999999.0, false);

		PIXI.BitmapFont.from("ScoreFont", {
			fontFamily: "Arial",
			fontSize: 20,
			strokeThickness: 0,
			fill: "white"
		});
	   
		const score = new PIXI.BitmapText("Score", { fontName: "ScoreFont" });
        this.addChild (score);

        this.show ();
    }

//------------------------------------------------------------------------------------------
}