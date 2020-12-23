//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { XButton } from './XButton';

//------------------------------------------------------------------------------------------
export class XSpriteButton extends XButton {
    private m_message:string;
    
    private m_buttonClassName:string;
    
//------------------------------------------------------------------------------------------
	public getParams (__params:Array<any> = null):void {
        this.m_buttonClassName = __params[0];
	}

//------------------------------------------------------------------------------------------
    public createHighlightTask ():void {
        this.addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                    
                () => {
                    (this.m_sprite as PIXI.AnimatedSprite).gotoAndStop (this.m_label);
                },
                                    
            XTask.GOTO, "loop",
        ]);
    }

//------------------------------------------------------------------------------------------
// create sprites
//------------------------------------------------------------------------------------------
	public  createSprites ():void {
		this.m_sprite = this.createAnimatedSprite (this.m_buttonClassName);
        this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);
			
		this.gotoState (XButton.NORMAL_STATE);
			
		this.m_currState = this.getNormalState ();
			
        this.show ();
	}

//------------------------------------------------------------------------------------------	
}
	
