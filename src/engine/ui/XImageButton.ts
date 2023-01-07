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
export class XImageButton extends XButton {
    public m_normalName:string;
    public m_overName:string;
    public m_downName:string;
    public m_selectedName:string;
    public m_disabledName:string;

    public m_9slice:boolean;
    public m_9size:number;
    public m_9width:number;
    public m_9height:number;

    public m_normal:PIXI.Sprite;
    public m_normal9:PIXI.NineSlicePlane;

    public m_over:PIXI.Sprite;
    public m_over9:PIXI.NineSlicePlane;

    public m_down:PIXI.Sprite;
    public m_down9:PIXI.NineSlicePlane;

    public m_selected:PIXI.Sprite;
    public m_selected9:PIXI.NineSlicePlane;

    public m_disabled:PIXI.Sprite;
    public m_disabled9:PIXI.NineSlicePlane;

    public m_pivotX:number;
    public m_pivotY:number;

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
        this.m_normalName = __params[this.m_paramIndex++];
        this.m_overName = __params[this.m_paramIndex++];
        this.m_downName = __params[this.m_paramIndex++];
        this.m_selectedName = __params[this.m_paramIndex++];
        this.m_disabledName = __params[this.m_paramIndex++];

        this.m_9slice = __params[this.m_paramIndex++];
        this.m_9size = __params[this.m_paramIndex++];
        this.m_9width = __params[this.m_paramIndex++];
        this.m_9height = __params[this.m_paramIndex++];

        this.m_pivotX = __params[this.m_paramIndex++];
        this.m_pivotY = __params[this.m_paramIndex++];
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
        var __sprite:PIXI.Container;

        this.addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                    
                () => {
                    if (!this.m_9slice) {
                        switch (this.m_label) {
                            case XButton.NORMAL_STATE:
                                __sprite = this.m_normal;
                                break;
                            case XButton.OVER_STATE:
                                __sprite = this.m_over;
                                break;
                            case XButton.DOWN_STATE:
                                __sprite = this.m_down;
                                break;
                            case XButton.SELECTED_STATE:
                                __sprite = this.m_selected;
                                break;
                            case XButton.DISABLED_STATE:
                                __sprite = this.m_disabled;
                                break;
                        }

                       this.enableButton (__sprite, [this.m_normal, this.m_over, this.m_down, this.m_selected, this.m_disabled]);

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
                                __sprite = this.m_selected9;
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
        this.m_normal = this.createSprite (this.m_normalName);
        this.addSpriteAsChild (
            this.m_normal, 
            -this.m_normal.width * this.m_pivotX, -this.m_normal.height * this.m_pivotY,
            this.getLayer (), this.getDepth (), 
            false
        );

        this.m_over = this.createSprite (this.m_overName);
        this.addSpriteAsChild (
            this.m_over, 
            -this.m_over.width * this.m_pivotX, -this.m_over.height * this.m_pivotY,
            this.getLayer (), this.getDepth (), 
            false
        );

        this.m_down = this.createSprite (this.m_downName);
        this.addSpriteAsChild (
            this.m_down, 
            -this.m_down.width * this.m_pivotX, -this.m_down.height * this.m_pivotY,
            this.getLayer (), this.getDepth (), 
            false
        );

        this.m_selected = this.createSprite (this.m_selectedName);
        this.addSpriteAsChild (
            this.m_selected, 
            -this.m_selected.width * this.m_pivotX, -this.m_selected.height * this.m_pivotY,
            this.getLayer (), this.getDepth (), 
            false
        );

        this.m_disabled = this.createSprite (this.m_disabledName);
        this.addSpriteAsChild (
            this.m_disabled, 
            -this.m_disabled.width * this.m_pivotX, -this.m_disabled.height * this.m_pivotY,
            this.getLayer (), this.getDepth (), 
            false
        );

        this.m_sprite = this.m_normal;

        if (this.m_9slice) {
            this.create9Slice ();

            this.m_normal.width = this.m_9width;
            this.m_normal.height = this.m_9height;
            this.m_normal.alpha = 0.0;

            this.m_over.width = this.m_9width;
            this.m_over.height = this.m_9height;
            this.m_over.alpha = 0.0;

            this.m_down.width = this.m_9width;
            this.m_down.height = this.m_9height;
            this.m_down.alpha = 0.0;

            this.m_selected.width = this.m_9width;
            this.m_selected.height = this.m_9height;
            this.m_selected.alpha = 0.0;

            this.m_disabled.width = this.m_9width;
            this.m_disabled.height = this.m_9height;
            this.m_disabled.alpha = 0.0;
        }

		this.gotoState (XButton.NORMAL_STATE);
			
		this.m_currState = this.getNormalState ();
			
        this.show ();
	}

//------------------------------------------------------------------------------------------
// create 9Slice
//------------------------------------------------------------------------------------------
    public create9Slice ():void {
        var __size:number = this.m_9size;

        this.m_normal9 = new PIXI.NineSlicePlane(this.m_normal.texture, __size, __size, __size, __size);
        this.addSortableChild (this.m_normal9, this.getLayer (), this.getDepth (), false);
        this.m_normal9.width = this.m_9width;
        this.m_normal9.height = this.m_9height;

        this.m_over9 = new PIXI.NineSlicePlane(this.m_over.texture, __size, __size, __size, __size);
        this.addSortableChild (this.m_over9, this.getLayer (), this.getDepth (), false);
        this.m_over9.width = this.m_9width;
        this.m_over9.height = this.m_9height;

        this.m_down9 = new PIXI.NineSlicePlane(this.m_down.texture, __size, __size, __size, __size);
        this.addSortableChild (this.m_down9, this.getLayer (), this.getDepth (), false);
        this.m_down9.width = this.m_9width;
        this.m_down9.height = this.m_9height;

        this.m_selected9 = new PIXI.NineSlicePlane(this.m_selected.texture, __size, __size, __size, __size);
        this.addSortableChild (this.m_selected9, this.getLayer (), this.getDepth (), false);
        this.m_selected9.width = this.m_9width;
        this.m_selected9.height = this.m_9height;

        this.m_disabled9 = new PIXI.NineSlicePlane(this.m_disabled.texture, __size, __size, __size, __size);
        this.addSortableChild (this.m_disabled9, this.getLayer (), this.getDepth (), false);
        this.m_disabled9.width = this.m_9width;
        this.m_disabled9.height = this.m_9height;
    }

//------------------------------------------------------------------------------------------	
}
	
