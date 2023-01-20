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
import { XApp } from "../app/XApp";

//------------------------------------------------------------------------------------------
export class Resource {
    public m_path:string;
    public m_loadComplete:boolean;
    public m_isDead:boolean;

    //------------------------------------------------------------------------------------------		
    constructor () {
        this.m_loadComplete = false;
        this.m_isDead = false;
    }

    //------------------------------------------------------------------------------------------
    public setup (__path:string):void {
        this.m_path = __path;
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        console.log (": resource: cleanup: ", this.m_path);

        this.m_isDead = true;
    }

    //------------------------------------------------------------------------------------------
    public unload ():void {
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        return null;
    }

    //------------------------------------------------------------------------------------------
    public getLoadComplete ():boolean {
        return this.m_loadComplete;
    }

//------------------------------------------------------------------------------------------
}