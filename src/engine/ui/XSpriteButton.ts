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
    public m_buttonClassName:string;
    public m_9slice:boolean;
    public m_9size:number;
    public m_9width:number;
    public m_9height:number;

    public m_normal9:PIXI.NineSlicePlane;
    public m_over9:PIXI.NineSlicePlane;
    public m_down9:PIXI.NineSlicePlane;
    public m_selected9:PIXI.NineSlicePlane;
    public m_disabled9:PIXI.NineSlicePlane;

    public m_graphics:PIXI.Graphics;

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
        
        if (this.m_normal9 != null) {
            this.m_normal9.destroy ();
        }

        if (this.m_over9 != null) {
            this.m_over9.destroy ();
        }

        if (this.m_down9 != null) {
            this.m_down9.destroy ();
        }

        if (this.m_selected9 != null) {
            this.m_selected9.destroy ();
        }

        if (this.m_disabled9 != null) {
            this.m_disabled9.destroy ();
        }
    }

//------------------------------------------------------------------------------------------
	public getParams (__params:Array<any> = null):void {
        this.m_buttonClassName = __params[0];
        this.m_9slice = __params[1];
        this.m_9size = __params[2];
        this.m_9width = __params[3];
        this.m_9height = __params[4];
	}

//------------------------------------------------------------------------------------------
    public getInteractiveArea(): PIXI.Container {
        return this.m_graphics;    
    }

//------------------------------------------------------------------------------------------
	// @ts-ignore
    public get width ():number {
        return this.m_9slice ? this.m_9width : this.m_sprite.width;
    }

//------------------------------------------------------------------------------------------
	// @ts-ignore
    public get height ():number {
        return this.m_9slice ? this.m_9height : this.m_sprite.height;
    }

//------------------------------------------------------------------------------------------
    public createHighlightTask ():void {
        var __sprite:PIXI.NineSlicePlane;

        this.addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                    
                () => {
                    if (!this.m_9slice) {
                        (this.m_sprite as PIXI.AnimatedSprite).gotoAndStop (this.m_label);
                    } else {
                        switch (this.m_label) {
                            case XButton.NORMAL_STATE:
                                __sprite = this.m_normal9;
                                break;
                            case XButton.OVER_STATE:
                                __sprite = this.m_over9;
                                break;
                            case XButton.DOWN_STATE:
                                __sprite = this.m_down9;
                                break;
                            case XButton.SELECTED_STATE:
                                __sprite = this.m_selected9;;
                                break;
                            case XButton.DISABLED_STATE:
                                __sprite = this.m_disabled9;
                                break;
                        }

                        this.enableButton (__sprite, [this.m_normal9, this.m_over9, this.m_down9, this.m_selected9, this.m_disabled9]);
                    }
                },
                                    
            XTask.GOTO, "loop",
        ]);
    }

//------------------------------------------------------------------------------------------
// create sprites
//------------------------------------------------------------------------------------------
	public createSprites ():void {
        this.m_sprite = this.createAnimatedSprite (this.m_buttonClassName);
        this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);

        if (this.m_9slice) {
            this.create9Slice ();

            this.m_sprite.width = this.m_9width;
            this.m_sprite.height = this.m_9height;

            this.m_sprite.alpha = 0.0;
        }

        var __width:number = this.m_sprite.width;
        var __height:number = this.m_sprite.height;

		var __graphics:PIXI.Graphics = this.m_graphics = new PIXI.Graphics ();
		__graphics.beginFill (0xff00ff);
		__graphics.drawRect (0, 0, __width, __height);
		__graphics.endFill ();
        __graphics.alpha = 0.01;
        this.addSortableChild (__graphics, this.getLayer (), this.getDepth () + 2, false);

		this.gotoState (XButton.NORMAL_STATE);
			
		this.m_currState = this.getNormalState ();
			
        this.show ();
	}

//------------------------------------------------------------------------------------------
// create 9Slice
//------------------------------------------------------------------------------------------
    public create9Slice ():void {
        var __sprite:PIXI.AnimatedSprite = (this.m_sprite as PIXI.AnimatedSprite);
        var __size:number = this.m_9size;

        var __textures:Array<PIXI.Texture<PIXI.Resource>> = __sprite.textures as any; // TODO PixiJS 6

        this.m_normal9 = new PIXI.NineSlicePlane(__textures[XButton.NORMAL_STATE], __size, __size, __size, __size);
        this.addSortableChild (this.m_normal9, this.getLayer (), this.getDepth (), false);
        this.m_normal9.width = this.m_9width;
        this.m_normal9.height = this.m_9height;

        this.m_over9 = new PIXI.NineSlicePlane(__textures[XButton.OVER_STATE], __size, __size, __size, __size);
        this.addSortableChild (this.m_over9, this.getLayer (), this.getDepth (), false);
        this.m_over9.width = this.m_9width;
        this.m_over9.height = this.m_9height;

        this.m_down9 = new PIXI.NineSlicePlane(__textures[XButton.DOWN_STATE], __size, __size, __size, __size);
        this.addSortableChild (this.m_down9, this.getLayer (), this.getDepth (), false);
        this.m_down9.width = this.m_9width;
        this.m_down9.height = this.m_9height;

        this.m_selected9 = new PIXI.NineSlicePlane(__textures[XButton.SELECTED_STATE], __size, __size, __size, __size);
        this.addSortableChild (this.m_selected9, this.getLayer (), this.getDepth (), false);
        this.m_selected9.width = this.m_9width;
        this.m_selected9.height = this.m_9height;

        this.m_disabled9 = new PIXI.NineSlicePlane(__textures[XButton.DISABLED_STATE], __size, __size, __size, __size);
        this.addSortableChild (this.m_disabled9, this.getLayer (), this.getDepth (), false);
        this.m_disabled9.width = this.m_9width;
        this.m_disabled9.height = this.m_9height;
    }

//------------------------------------------------------------------------------------------	
}
	
