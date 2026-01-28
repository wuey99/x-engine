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

//------------------------------------------------------------------------------------------
export interface XStageParams {
    containerId: string,
    canvasW: number,
    canvasH: number,
    screenW: number,
    screenH: number,
    devicePixelRatio:number
}

//------------------------------------------------------------------------------------------
export class XStage {
    public m_XApp:XApp

    public container: HTMLElement;
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;

    public CANVAS_WIDTH:number = 1366;
    public CANVAS_HEIGHT:number = 546;
    public SCREEN_WIDTH:number = 2732;
    public SCREEN_HEIGHT:number = 1088;
    public scaleRatio:number = 1;

    public m_mousePoint:XPoint;
    public m_touchPoint:XPoint;

    public m_canvasWidth:number;
    public m_canvasHeight:number;
    public m_screenWidth:number;
    public m_screenHeight:number;
    public m_scaleXRatio:number;
    public m_scaleYRatio:number;

    public m_scaleRatio:number;
    public m_xoffset:number;
    public m_yoffset:number;

    public m_resizeTrigger:boolean;
    public m_windowResizeSignal:XSignal;

    public m_pointerDownHandle:any;
    public m_pointerMoveHandle:any;
    public m_touchMoveHandle:any;
    public m_visibilityChangedHandle:any;
    public m_resizerHandle:any;

    public m_firstClick:boolean;

    public m_resizerTask:XTask;

//------------------------------------------------------------------------------------------
    constructor () {
    }

//------------------------------------------------------------------------------------------
    async setup (__XApp:XApp, params:XStageParams, __container:HTMLElement = null) {
        this.m_XApp = __XApp;

        this.renderer = await PIXI.autoDetectRenderer ({
            backgroundAlpha: 0.0,
            width: this.getWindowWidth (), // params.canvasW,
            height: this.getWindowHeight (), // params.canvasH,
            antialias: true
        }) as PIXI.Renderer;

        this.SCREEN_WIDTH = params.screenW;
        this.SCREEN_HEIGHT = params.screenH;

        console.log (": renderer: ", this.renderer, this.renderer.view)

        this.stage = new PIXI.Container ();

        this.stage.interactive = true;
        this.stage.interactiveChildren = true;

        switch (Math.round (params.devicePixelRatio)) {
            case 1:
                this.scaleRatio = 1; // 2;
                break;
            case 2:
                this.scaleRatio = 1;
                break;
            case 3:
                this.scaleRatio = 1;
                break;
            case 4:
                this.scaleRatio = 1;
                break;
            default:
                this.scaleRatio = 1;
                break;
        }

        console.log (": -------------------------->: window.devicePixelRatio: ", Math.round (params.devicePixelRatio));
            
        console.log (": ", this.stage)

        if (__container != null) {
            this.container = __container;
        } else {
            this.container = params.containerId ? document.getElementById(params.containerId) || document.body : document.body;
        }

        console.log (": container: ", this.container)

        this.container.appendChild (this.renderer.canvas as any);

        this.setupResizer ();

        this.m_mousePoint = new XPoint ();
        this.m_touchPoint = new XPoint ();

        this.m_firstClick = false;

        this.getStage ().on ("pointerup", this.m_pointerDownHandle = (e:FederatedPointerEvent) => {
            this.m_firstClick = true;
        });

        this.getStage ().on ("pointermove", this.m_pointerMoveHandle = (e:FederatedPointerEvent) => {
            var __mousePos:PIXI.Point = this.getStage ().toLocal (e.global);

            this.m_mousePoint.x = __mousePos.x;
            this.m_mousePoint.y = __mousePos.y;
        
            // console.log (": XApp: pointermove: ", this.m_mousePoint);

            // this.m_main.setDebugMessage ("" + __mousePos.x + ", " + __mousePos.y);
        });

        this.getStage ().on ("touchmove", this.m_touchMoveHandle = (e:FederatedPointerEvent) => {
            var __mousePos:PIXI.Point = this.getStage ().toLocal (e.global);

            this.m_touchPoint.x = __mousePos.x;
            this.m_touchPoint.y = __mousePos.y;

            // this.m_main.setDebugMessage ("" + __mousePos.x + ", " + __mousePos.y);
        });
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        this.m_XApp.getXSignalManager ().removeXSignal (this.m_windowResizeSignal);
        this.m_XApp.getXTaskManager ().removeTask (this.m_resizerTask);

        this.getStage ().off ("pointerdown", this.m_pointerDownHandle);
        this.getStage ().off ("pointermove", this.m_pointerMoveHandle);
        this.getStage ().off ("touchmove", this.m_touchMoveHandle);
        document.removeEventListener ("visibilitychange", this.m_visibilityChangedHandle);
        window.removeEventListener ("resize", this.m_resizerHandle);

        this.container.removeChild (this.renderer.view as any);
  
        console.log (": render: destroy: ");
        
        this.renderer.destroy ();
        this.renderer = null;
    }

//------------------------------------------------------------------------------------------
    public setupResizer ():void {
        this.m_resizeTrigger = false;

        this.m_windowResizeSignal = this.m_XApp.getXSignalManager ().createXSignal ();

        window.addEventListener ("resize", this.m_resizerHandle = () => {
            this.m_resizeTrigger = true;
        });

        this.m_resizerTask = this.m_XApp.getXTaskManager ().addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0800,

                XTask.FLAGS, (__task:XTask) => {
                    __task.ifTrue (this.m_resizeTrigger);
                }, XTask.BNE, "loop",

                () => {
                    this.resize ();

                    this.m_resizeTrigger = false;
                },

                XTask.GOTO, "loop",
            XTask.RETN,
        ]);
        
        this.resize ();
    }

//------------------------------------------------------------------------------------------
    public addWindowResizeListener (__listener:any):number {
        return this.m_windowResizeSignal.addListener (__listener);
    }

//------------------------------------------------------------------------------------------
    public removeWindowResizeListener (__id:number):void {
        this.m_windowResizeSignal.removeListener (__id);
    }

    //------------------------------------------------------------------------------------------
    public getCanvasWidth ():number {
        return this.m_canvasWidth;
    }

    //------------------------------------------------------------------------------------------
    public getCanvasHeight ():number {
        return this.m_canvasHeight;
    }

    //------------------------------------------------------------------------------------------
    public getScreenWidth ():number {
        return this.m_screenWidth;
    }

    //------------------------------------------------------------------------------------------
    public getScreenHeight ():number {
        return this.m_screenHeight;
    }
        
    //------------------------------------------------------------------------------------------
    public getXOffset ():number {
        return this.m_xoffset;
    }
        
    //------------------------------------------------------------------------------------------
    public getYOffset ():number {
        return this.m_yoffset;
    }
        
    //------------------------------------------------------------------------------------------
    public getScaleRatio ():number {
        return this.m_scaleRatio;
    }

    //------------------------------------------------------------------------------------------
    public getRenderer ():PIXI.Renderer {
        return this.renderer;
    }

    //------------------------------------------------------------------------------------------
    public getStage ():PIXI.Container {
        return this.stage;
    }

    //------------------------------------------------------------------------------------------l
    public gotFirstClick ():boolean {
        return this.m_firstClick;
    }

    //------------------------------------------------------------------------------------------
    public getMousePos ():XPoint {
        return this.m_mousePoint;
    }

    //------------------------------------------------------------------------------------------
    public getTouchPos ():XPoint {
        return this.m_touchPoint;
    }

    //------------------------------------------------------------------------------------------
    // overridable methods
    //------------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------------
    public getWindowWidth ():number {
        return 0;
    }

    //------------------------------------------------------------------------------------------
    public getWindowHeight ():number {
        return 0;
    }

    //------------------------------------------------------------------------------------------
    protected resize ():void {
    }

    //------------------------------------------------------------------------------------------
    protected setupSize (__canvasWidth:number, __canvasHeight:number, __screenWidth:number, __screenHeight:number):void {
    }

    //------------------------------------------------------------------------------------------
    protected fitScreenToCanvas ():void {
    }

//------------------------------------------------------------------------------------------
}