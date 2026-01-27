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
import * as PIXI from 'pixi.js'
import { FederatedPointerEvent } from 'pixi.js';
import { XPoint } from '../geom/XPoint';
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XTask } from '../task/XTask';
import { G } from '../app/G';
import { XStage, XStageParams } from './XStage';

//------------------------------------------------------------------------------------------
export class XStageBrowserWindow extends XStage {

//------------------------------------------------------------------------------------------
    constructor () {
        super ();
    }

//------------------------------------------------------------------------------------------
    async setup (__XApp:XApp, params:XStageParams, __container:HTMLElement = null) {
        await super.setup (__XApp, params, __container);
    }

    //------------------------------------------------------------------------------------------
    protected getWindowWidth ():number {
        if (XApp.FULL_SCREEN) {
            return window.innerWidth;
        }

        var __gameElement:HTMLElement = document.getElementById ("game");
        var __rect:DOMRect = __gameElement.getBoundingClientRect ();

        console.log (": domRect: ", __rect, window.innerWidth, window.innerHeight);

        return Math.min (__rect.width, window.innerWidth - __rect.x);
    }

    //------------------------------------------------------------------------------------------
    protected getWindowHeight ():number {
        if (XApp.FULL_SCREEN) {
            return window.innerHeight;
        }

        var __gameElement:HTMLElement = document.getElementById ("game");
        var __rect:DOMRect = __gameElement.getBoundingClientRect ();

        return Math.min (__rect.height, window.innerHeight - __rect.y) - 0;
    }

//------------------------------------------------------------------------------------------
    protected resize ():void {
        // console.log (": XApp: resize: ", this.getWindowWidth (), this.getWindowHeight ());

        this.getRenderer ().resize (window.innerWidth, window.innerHeight);

        // this.getRenderer ().resize (this.getWindowWidth (), this.getWindowHeight ());

        this.setupSize (
            this.getWindowWidth (), this.getWindowHeight (),
            this.SCREEN_WIDTH, this.SCREEN_HEIGHT
        );

        this.fitScreenToCanvas ();

        this.m_windowResizeSignal.fireSignal ();
    }

    //------------------------------------------------------------------------------------------
    protected setupSize (__canvasWidth:number, __canvasHeight:number, __screenWidth:number, __screenHeight:number):void {
        this.CANVAS_WIDTH = __canvasWidth;
        this.CANVAS_HEIGHT = __canvasHeight;

        this.m_canvasWidth = __canvasWidth;
        this.m_canvasHeight = __canvasHeight;

        this.m_screenWidth = __screenWidth;
        this.m_screenHeight = __screenHeight;

        this.m_scaleXRatio = this.m_screenWidth / this.m_canvasWidth;
        this.m_scaleYRatio = this.m_screenHeight / this.m_canvasHeight;
    }

    //------------------------------------------------------------------------------------------
    protected fitScreenToCanvas ():void {
        var __scaleX:number = this.getCanvasWidth () / this.getScreenWidth ();
        var __scaleY:number = this.getCanvasHeight () / this.getScreenHeight ();
            
        this.m_scaleRatio = Math.min (__scaleX, __scaleY);
            
        this.m_xoffset = (this.getCanvasWidth () - this.getScreenWidth () * this.m_scaleRatio) / 2;
        this.m_yoffset = (this.getCanvasHeight () - this.getScreenHeight () * this.m_scaleRatio) / 2;
    }
}