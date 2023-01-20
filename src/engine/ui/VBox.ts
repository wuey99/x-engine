//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { Box } from './Box';
import { XJustify } from './XJustify';

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
export class VBox extends Box {

//------------------------------------------------------------------------------------------
public reorder ():void {
    super.reorder ();

    //------------------------------------------------------------------------------------------
    var __y:number = 0;
    var __height:number = 0;
    var __spacing:number = 0;

    var i:number;

    //------------------------------------------------------------------------------------------
    switch (this.m_justify) {
        
        //------------------------------------------------------------------------------------------
        case XJustify.START:
            __y = this.m_topPadding;

            for (i = 0; i < this.m_items.length; i++) {
                this.m_items[i].y = __y;
                __y += this.m_items[i].height + this.m_spacing;
            }

            break;

        //------------------------------------------------------------------------------------------
        case XJustify.END:
            __y = this.getActualHeight () - this.m_items[this.m_items.length - 1].height;

            for (i = this.m_items.length - 1; i >= 0; i--) {
                this.m_items[i].y = __y;
                __y -= this.m_items[i].height + this.m_spacing;
            }

            break;

        //------------------------------------------------------------------------------------------
        case XJustify.CENTER:
            for (i = 0; i < this.m_items.length; i++) {
                __height += this.m_items[i].height;
            }

            __y = this.m_topPadding + (this.getActualHeight () - __height) / 2;

            for (i = 0; i < this.m_items.length; i++) {
                this.m_items[i].y = __y;
                __y += this.m_items[i].height;
            }

            break;

        //------------------------------------------------------------------------------------------
        case XJustify.SPACE_BETWEEN:
            if (this.m_items.length > 1) {
                for (i = 0; i < this.m_items.length; i++) {
                    __height += this.m_items[i].height;
                }

                __spacing = (this.getActualHeight () - __height) / (this.m_items.length - 1);
            }

            __y = this.m_topPadding;

            for (i = 0; i < this.m_items.length; i++) {
                this.m_items[i].y = __y;
                __y += this.m_items[i].height + __spacing;
            }

            break;

        //------------------------------------------------------------------------------------------
        case XJustify.SPACE_AROUND:
            if (this.m_items.length > 1) {
                for (i = 0; i < this.m_items.length; i++) {
                    __height += this.m_items[i].height;
                }

                __spacing = (this.getActualHeight () - __height / 4 - __height) / (this.m_items.length - 1);
            }

            __y = this.m_topPadding + __height / 8;

            for (i = 0; i < this.m_items.length; i++) {
                this.m_items[i].y = __y;
                __y += this.m_items[i].height + __spacing;
            }

            break;

        //------------------------------------------------------------------------------------------
        case XJustify.SPACE_EVENLY:
            for (i = 0; i < this.m_items.length; i++) {
                __y = i / (this.m_items.length - 1);

                this.verticalPercent (this.m_items[i], __y);
            }

            break;

        //------------------------------------------------------------------------------------------
        case XJustify.NONE:
            break;
    }
}

//------------------------------------------------------------------------------------------	
}
	
