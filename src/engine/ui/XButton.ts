//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014-2021 Jimmy Huey (wuey99@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// <$end$/>
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';

//------------------------------------------------------------------------------------------
export class XButton extends XGameObject {
	public m_sprite:PIXI.Container;

	public static NORMAL_STATE:number = 0;
	public static OVER_STATE:number = 1;
	public static DOWN_STATE:number = 2;
	public static SELECTED_STATE:number = 3;
	public static DISABLED_STATE:number = 4;
				
	public m_label:number;
	public m_currState:number;
	public m_disabledFlag:boolean;
    public m_keyboardDownListener:number;

	public m_trigger:string;
	
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

		this.getParams (__params);

        this.createSprites ();
        
        this.m_disabledFlag = false;
        
		this.enableInteractivity ([
			"pointerover",
			"pointerdown",
			"pointermove",
			"pointerup",
			"pointerout",
			"pointerupoutside"
		]);
        
        this.gotoState (this.getNormalState ());
        
        this.m_currState = this.getNormalState ();
    
        this.createHighlightTask ();	

        return this;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
	public getInteractiveArea ():PIXI.Container {
		return this.m_sprite;
	}

//------------------------------------------------------------------------------------------
	public setTrigger (__value:string):void {
		this.m_trigger = __value;
	}

//------------------------------------------------------------------------------------------
	public getTrigger ():string {
		return this.m_trigger;
	}

//------------------------------------------------------------------------------------------
	public getParams (__params:Array<any> = null):void {
	}
	
//------------------------------------------------------------------------------------------
	public enableButton (__sprite:PIXI.Container, __sprites:Array<PIXI.Container>):void {
		var __disable:PIXI.Container;

		for (__disable of __sprites) {
			__disable.alpha = 0.0;
		}

		__sprite.alpha = 1.0;

		this.m_sprite = __sprite;
	}

//------------------------------------------------------------------------------------------
	public createHighlightTask ():void {
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
			
		this.gotoState (XButton.OVER_STATE);
			
		this.m_currState = XButton.OVER_STATE;
	}
		
//------------------------------------------------------------------------------------------
	public  __onMouseDown ():void {	
		if (this.m_disabledFlag) {
			return;
		}
			
		this.gotoState (XButton.DOWN_STATE);	
			
		this.m_currState = XButton.DOWN_STATE;
			
		this.fireMouseDownSignal ();
	}

//------------------------------------------------------------------------------------------
	public __onMouseUp ():void {
		if (this.m_disabledFlag) {
			return;
		}
			
		this.gotoState (this.getNormalState ());
			
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
			
		this.gotoState (this.getNormalState ());
			
		this.m_currState = this.getNormalState ();
			
		this.fireMouseOutSignal ();
	}
		
//------------------------------------------------------------------------------------------
	public onMouseOver (e:FederatedPointerEvent):void {
		this.__onMouseOver ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseDown (e:FederatedPointerEvent):void {
		this.__onMouseDown ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseUp (e:FederatedPointerEvent):void {
		this.__onMouseUp ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseMove (e:FederatedPointerEvent):void {	
		this.__onMouseMove ();
	}			
		
//------------------------------------------------------------------------------------------	
	public onMouseOut (e:FederatedPointerEvent):void {
		this.__onMouseOut ();
	}			

//------------------------------------------------------------------------------------------
	public setNormalState ():void {
		this.gotoState (this.getNormalState ());
			
		this.m_currState = this.getNormalState ();		
	}

//------------------------------------------------------------------------------------------
	public getNormalState ():number {
		return XButton.NORMAL_STATE;
	}
		
//------------------------------------------------------------------------------------------
	public isDisabled ():boolean {
		return this.m_disabledFlag;
	}
			
//------------------------------------------------------------------------------------------
	public setEnabled (__enabled:boolean = true):void {
		this.setDisabled (!__enabled);
	}

//------------------------------------------------------------------------------------------
	public setDisabled (__disabled:boolean = true):void {
		if (__disabled) {
			this.gotoState (XButton.DISABLED_STATE);
							
			this.m_disabledFlag = true;
		} else {
			this.setNormalState ();
				
			this.m_disabledFlag = false;
		}
	}
		
//------------------------------------------------------------------------------------------
// create sprites
//------------------------------------------------------------------------------------------
	public createSprites ():void {
	}

//------------------------------------------------------------------------------------------
	public gotoState (__label:number):void {
		this.m_label = __label;
	}

//------------------------------------------------------------------------------------------	
}
	
