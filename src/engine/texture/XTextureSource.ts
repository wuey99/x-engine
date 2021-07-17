//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014 Jimmy Huey (wuey99@gmail.com)
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
    import * as PIXI from 'pixi.js-legacy'
    import { XApp } from "../app/XApp";
    import { Resource} from '../resource/Resource';
    import { XTask } from '../task/XTask';
    import { XType } from '../type/XType';
    import { MaxRectPacker } from './MaxRectPacker';
	import { XSubTextureManager } from './XSubTextureManager';
    import { XAnimatedSpriteSubTextureManager } from './XAnimatedSpriteSubTextureManager';

//------------------------------------------------------------------------------------------
// XTextureSource
//------------------------------------------------------------------------------------------
export class XTextureSource {
    public m_displayObject:PIXI.DisplayObject;
    public m_frame:number;

    //------------------------------------------------------------------------------------------
    public constructor () {
        this.m_frame = 1;
    }

    //------------------------------------------------------------------------------------------
    public cleanup () {
    }

    //------------------------------------------------------------------------------------------
    public totalFrames ():number {
        return 0;
    }

    //------------------------------------------------------------------------------------------
    public gotoAndStop (__frame:number):void {
    }

    //------------------------------------------------------------------------------------------
    public getDisplayObject ():PIXI.DisplayObject {
        return null;
    }

    //------------------------------------------------------------------------------------------
}
