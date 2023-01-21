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
import { Assets } from 'pixi.js';
import { XApp } from "../app/XApp";
import { Resource } from './Resource';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class SpriteSheetResourceX extends Resource {
    public m_spritesheet:PIXI.Spritesheet;

    //------------------------------------------------------------------------------------------		
    constructor () {
        super ();
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
		Assets.load (this.m_path).then ((__spritesheet:PIXI.Spritesheet) => {
            console.log (": SpriteSheetResource: loadComplete: ", __spritesheet);

            if (this.m_isDead) {
                console.log (": isDead: ", this.m_path);

                if (this.getResource () != null) {
                    (this.getResource () as PIXI.Spritesheet).destroy ();
                }
            } else {
                this.m_spritesheet = __spritesheet;
                
                this.m_loadComplete = true;
            }
        });
    }

    //------------------------------------------------------------------------------------------
    public unload ():void {
        if (!this.m_isDead) {
            if (this.getResource () != null) {
                (this.getResource () as PIXI.Spritesheet).destroy ();
            }

            this.m_loadComplete = false;
        }
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        if (this.getLoadComplete ()) {
            return this.m_spritesheet;
        } else {
            return null;
        }
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
        
        if (this.getResource () != null) {
            (this.getResource () as PIXI.Spritesheet).destroy ();
        } else {
            console.log (": error: ", this.m_path);
        }
    }

//------------------------------------------------------------------------------------------
}