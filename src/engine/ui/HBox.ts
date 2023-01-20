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
import { Box } from './Box';
import { XJustify } from './XJustify';

//------------------------------------------------------------------------------------------
export class HBox extends Box {

//------------------------------------------------------------------------------------------
    public reorder ():void {
        super.reorder ();

        //------------------------------------------------------------------------------------------
        var __x:number = 0;
        var __width:number = 0;
        var __spacing:number = 0;

        var i:number;

        //------------------------------------------------------------------------------------------
        switch (this.m_justify) {

            //------------------------------------------------------------------------------------------
            case XJustify.START:
                __x = this.m_leftPadding;

                for (i = 0; i < this.m_items.length; i++) {
                    this.m_items[i].x = __x;
                    __x += this.m_items[i].width + this.m_spacing;
                }

                break;

            //------------------------------------------------------------------------------------------
            case XJustify.END:
                __x = this.getActualWidth () - this.m_items[this.m_items.length - 1].width;

                for (i = this.m_items.length - 1; i >= 0; i--) {
                    this.m_items[i].x = __x;
                    __x -= this.m_items[i].width + this.m_spacing;
                }

                break;

            //------------------------------------------------------------------------------------------
            case XJustify.CENTER:
                for (i = 0; i < this.m_items.length; i++) {
                    __width += this.m_items[i].width;
                }

                __x = this.m_leftPadding + (this.getActualWidth () - __width) / 2;
    
                for (i = 0; i < this.m_items.length; i++) {
                    this.m_items[i].x = __x;
                    __x += this.m_items[i].width;
                }
    
                break;

            //------------------------------------------------------------------------------------------
            case XJustify.SPACE_BETWEEN:
                if (this.m_items.length > 1) {
                    for (i = 0; i < this.m_items.length; i++) {
                        __width += this.m_items[i].width;
                    }

                    __spacing = (this.getActualWidth () - __width) / (this.m_items.length - 1);
                }

                __x = this.m_leftPadding;

                for (i = 0; i < this.m_items.length; i++) {
                    this.m_items[i].x = __x;
                    __x += this.m_items[i].width + __spacing;
                }

                break;

            //------------------------------------------------------------------------------------------
            case XJustify.SPACE_AROUND:
                if (this.m_items.length > 1) {
                    for (i = 0; i < this.m_items.length; i++) {
                        __width += this.m_items[i].width;
                    }

                    __spacing = (this.getActualWidth () - __width / 4 - __width) / (this.m_items.length - 1);
                }

                __x = this.m_leftPadding + __width / 8;

                for (i = 0; i < this.m_items.length; i++) {
                    this.m_items[i].x = __x;
                    __x += this.m_items[i].width + __spacing;
                }

                break;

            //------------------------------------------------------------------------------------------
            case XJustify.SPACE_EVENLY:
                for (i = 0; i < this.m_items.length; i++) {
                    __x = i / (this.m_items.length - 1);
    
                    this.horizontalPercent (this.m_items[i], __x);
                }

                break;

            //------------------------------------------------------------------------------------------
            case XJustify.NONE:
                break;
        }
    }

//------------------------------------------------------------------------------------------	
}
	
