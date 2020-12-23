//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';

//------------------------------------------------------------------------------------------
export class XButton extends XGameObject {
	private m_sprite:PIXI.AnimatedSprite;
	private m_buttonClassName:string;
	private m_mouseDownSignal:XSignal;
	private m_mouseUpSignal:XSignal;
	private m_mouseOutSignal:XSignal;
	private m_keyboardDownSignal:XSignal;
	private m_keyboardUpSignal:XSignal;

	public static NORMAL_STATE:number = 1;
	public static OVER_STATE:number = 2;
	public static DOWN_STATE:number = 3;
	public static SELECTED_STATE:number = 4;
	public static DISABLED_STATE:number = 5;
				
	public m_label:number;
	public m_currState:number;
	private m_disabledFlag:boolean;
    private m_keyboardDownListener:number;
		
//------------------------------------------------------------------------------------------
	public constructor () {
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

        this.m_buttonClassName = __params[0];

        this.m_mouseDownSignal = this.createXSignal ();	
        this.m_mouseOutSignal = this.createXSignal ();
        this.m_mouseUpSignal = this.createXSignal ();
        this.m_keyboardDownSignal = this.createXSignal ();
        this.m_keyboardUpSignal = this.createXSignal ();
        
        this.createSprites ();
        
        this.m_sprite.interactive = true;
        this.m_sprite.interactiveChildren = true;
        
        this.m_disabledFlag = false;
        
        this.setupListeners ();
        
        this.__gotoState (this.getNormalState ());
        
        this.m_currState = this.getNormalState ();
    
        this.createHighlightTask ();	

        return this;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();

        this.cleanupListeners ();
    }

//------------------------------------------------------------------------------------------
	public setupListeners ():void {		
	    this.addTask ([
			() => {
				this.m_sprite.on ("pointerover", this.onMouseOver.bind (this));
				this.m_sprite.on ("pointerdown", this.onMouseDown.bind (this));
				this.m_sprite.on ("pointermove", this.onMouseMove.bind (this));
				this.m_sprite.on ("pointerup", this.onMouseUp.bind (this));
				this.m_sprite.on ("pointerout", this.onMouseOut.bind (this));
                // m_keyboardDownListener = xxx.addKeyboardDownListener (onKeyboardDown);
			},
				
			XTask.RETN,
		]);
	}
		
//------------------------------------------------------------------------------------------
	public cleanupListeners ():void {
        /*
			m_sprite.removeEventListener (xxx.MOUSE_OVER, onMouseOver);
			m_sprite.removeEventListener (xxx.MOUSE_DOWN, onMouseDown);
			m_sprite.removeEventListener (xxx.MOUSE_MOVE, onMouseMove);
			m_sprite.removeEventListener (xxx.MOUSE_UP, onMouseUp);
			m_sprite.removeEventListener (xxx.MOUSE_OUT, onMouseOut);
            xxx.removeKeyboardDownListener (m_keyboardDownListener);
        */

       this.m_mouseDownSignal.removeAllListeners ();
       this.m_mouseUpSignal.removeAllListeners ();
       this.m_mouseOutSignal.removeAllListeners ();
	}

//------------------------------------------------------------------------------------------
	public onKeyboardDown (e:PIXI.InteractionEvent):void {
		this.m_keyboardDownSignal.fireSignal (e);
	}
		
//------------------------------------------------------------------------------------------
	public onKeyboardUp (e:PIXI.InteractionEvent):void {
		this.m_keyboardUpSignal.fireSignal (e);
	}

//------------------------------------------------------------------------------------------
	public addKeyboardDownListener (__listener:any):number {
		return this.m_keyboardDownSignal.addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public addKeyboardUpListener (__listener:any):number{
		return this.m_keyboardUpSignal.addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public createHighlightTask ():void {
		this.addTask ([
			XTask.LABEL, "__loop",
				XTask.WAIT, 0x0100,
					
				() => {
					this.m_sprite.gotoAndStop (this.m_label);
				},
									
			XTask.GOTO, "__loop",
		]);
	}
		
//------------------------------------------------------------------------------------------
	public addMouseUpEventListener (__listener:any):void {
		this.m_sprite.on ("pointerup", __listener);
	}

//------------------------------------------------------------------------------------------
	public __onMouseOver ():void {	
		if (this.m_disabledFlag) {
			return;
		}
			
		this.__gotoState (XButton.OVER_STATE);
			
		this.m_currState = XButton.OVER_STATE;
	}
		
//------------------------------------------------------------------------------------------
	public  __onMouseDown ():void {	
		if (this.m_disabledFlag) {
			return;
		}
			
		this.__gotoState (XButton.DOWN_STATE);	
			
		this.m_currState = XButton.DOWN_STATE;
			
		this.fireMouseDownSignal ();
	}

//------------------------------------------------------------------------------------------
	public __onMouseUp ():void {
		if (this.m_disabledFlag) {
			return;
		}
			
		this.__gotoState (this.getNormalState ());
			
		this.m_currState = this.getNormalState ();
			
		this.fireMouseUpSignal ();			
	}
		
//------------------------------------------------------------------------------------------
	public __onMouseMove ():void {
	}
		
//------------------------------------------------------------------------------------------
	public __onMouseOut ():void {
	    if (this.m_disabledFlag) {
			return;
		}
			
		this.__gotoState (this.getNormalState ());
			
		this.m_currState = this.getNormalState ();
			
		this.fireMouseOutSignal ();
	}
		
//------------------------------------------------------------------------------------------
	public onMouseOver (e:PIXI.InteractionData):void {
		this.__onMouseOver ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseDown (e:PIXI.InteractionData):void {
		this.__onMouseDown ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseUp (e:PIXI.InteractionData):void {
		this.__onMouseUp ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseMove (e:PIXI.InteractionData):void {	
		this.__onMouseMove ();
	}			
		
//------------------------------------------------------------------------------------------	
	public onMouseOut (e:PIXI.InteractionData):void {
		this.__onMouseOut ();
	}			

//------------------------------------------------------------------------------------------
	public setNormalState ():void {
		this.__gotoState (this.getNormalState ());
			
		this.m_currState = this.getNormalState ();		
	}

//------------------------------------------------------------------------------------------
	private getNormalState ():number {
		return XButton.NORMAL_STATE;
	}
		
//------------------------------------------------------------------------------------------
	public isDisabled ():boolean {
		return this.m_disabledFlag;
	}
			
//------------------------------------------------------------------------------------------
	public setDisabled (__disabled:boolean):void {
		if (__disabled) {
			this.__gotoState (XButton.DISABLED_STATE);
							
			this.m_disabledFlag = true;
		} else {
			this.setNormalState ();
				
			this.m_disabledFlag = false;
		}
	}
		
//------------------------------------------------------------------------------------------
// create sprites
//------------------------------------------------------------------------------------------
	public  createSprites ():void {
		this.m_sprite = this.createAnimatedSprite (this.m_buttonClassName);
        this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);
			
		this.__gotoState (XButton.NORMAL_STATE);
			
		this.m_currState = this.getNormalState ();
			
		this.show ();
	}

//------------------------------------------------------------------------------------------
	public gotoState (__label:number):void {
		this.m_label = __label;
	}
		
//------------------------------------------------------------------------------------------
	private __gotoState (__label:number):void {
		this.m_label = __label;
	}

//------------------------------------------------------------------------------------------
	public addMouseDownListener (__listener:any):number {
		return this.m_mouseDownSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public fireMouseDownSignal ():void {
		this.m_mouseDownSignal.fireSignal ();
	}
						
//------------------------------------------------------------------------------------------
	public addMouseUpListener (__listener:any):number {
		return this.m_mouseUpSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public fireMouseUpSignal ():void {
		this.m_mouseUpSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
	public addMouseOutListener (__listener:any):number {
		return this.m_mouseOutSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public fireMouseOutSignal ():void {
		this.m_mouseOutSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------	
}
	
