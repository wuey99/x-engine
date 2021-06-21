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
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { TextInput } from 'pixi-textinput-v5';
import { Box } from './Box';
import { XJustify } from './XJustify';
import { XHorzAlign } from './XHorzAlign';
import { XVertAlign } from './XVertAlign';

//------------------------------------------------------------------------------------------
export class XGridRow extends Box {
    public m_horzAlign:string;
    public m_vertAlign:string;
    public m_cellWidth:number;
    public m_cellHeight:number;

//------------------------------------------------------------------------------------------
    public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);	

        this.m_cellWidth = __params[this.m_paramIndex++];
        this.m_cellHeight = __params[this.m_paramIndex++];
        this.m_horzAlign = __params[this.m_paramIndex++];
        this.m_vertAlign = __params[this.m_paramIndex++];

        return this;
    }

//------------------------------------------------------------------------------------------
    public reorder ():void {
        super.reorder ();

        //------------------------------------------------------------------------------------------
        var __x:number = 0;
        
        var i:number;

        for (i = 0; i < this.m_items.length; i++) {
            switch (this.m_horzAlign) {
                case XHorzAlign.LEFT:
                    this.m_items[i].x = __x;
                    break;
                case XHorzAlign.CENTER:
                    this.m_items[i].x = __x + (this.m_cellWidth - this.m_items[i].width) / 2;
                    break;
                case XHorzAlign.RIGHT:
                    this.m_items[i].x = __x + this.m_cellWidth - this.m_items[i].width;
                    break;
            }

            switch (this.m_vertAlign) {
                case XVertAlign.TOP:
                    this.m_items[i].y = 0;
                    break;
                case XVertAlign.CENTER:
                    this.m_items[i].y = (this.m_cellHeight - this.m_items[i].height) / 2;
                    break;
                case XVertAlign.BOTTOM:
                    this.m_items[i].y = this.m_cellHeight - this.m_items[i].height;
                    break;
            }

            __x += this.m_cellWidth;
        }
    }

//------------------------------------------------------------------------------------------	
}
	
