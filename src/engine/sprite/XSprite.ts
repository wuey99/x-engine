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
import * as PIXI from 'pixi.js-legacy'
import { XWorld } from './XWorld';
import { XApp } from '../app/XApp';

//------------------------------------------------------------------------------------------
export class XSprite extends PIXI.Sprite {

    public m_world:XWorld;
    public static g_XApp:XApp;

    //------------------------------------------------------------------------------------------
    constructor () {
        super ();
    }

	//------------------------------------------------------------------------------------------
	public setup ():void {
	}
		
	//------------------------------------------------------------------------------------------
	public cleanup ():void {
    }
        
	//------------------------------------------------------------------------------------------
	public static setXApp (__XApp:XApp):void {
		XSprite.g_XApp = __XApp;
	}
        
    //------------------------------------------------------------------------------------------
    public get world ():XWorld {
        return this.m_world;
    }
    
    //------------------------------------------------------------------------------------------
    public set world (__XWorld:XWorld) {
        this.m_world = __XWorld;		
    }

//------------------------------------------------------------------------------------------    
}