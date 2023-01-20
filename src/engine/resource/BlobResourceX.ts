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
import { Assets, LoaderParser } from '@pixi/assets';
import { XApp } from "../app/XApp";
import { Resource } from './Resource';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
const loadBin = {
    extension: {
        type: PIXI.ExtensionType.LoadParser,
        priority: 0
    },

    test (url: string):boolean {
        return (PIXI.utils.path.extname(url).toLowerCase() === '.bin');
    },

    async load<T> (url: string):Promise<T> {
        const response = await PIXI.settings.ADAPTER.fetch(url);
  
        const data = await response.blob();
  
        return data as T;
    },
} as LoaderParser;

//------------------------------------------------------------------------------------------
export class BlobResourceX extends Resource {
    public m_data:any;

    //------------------------------------------------------------------------------------------		
    constructor () {
        super ();
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
		Assets.load (this.m_path).then ((__data:any) => {
            // console.log (": BlobResource: loadComplete: ", this);

            if (this.m_isDead) {
                console.log (": isDead: ", this.m_path);

                if (this.getResource () != null) {
                    // destroy
                }
            } else {
                __data.arrayBuffer ().then ((__data:any) => {
                    this.m_data = __data;      

                    this.m_loadComplete = true;
                });
            }
        });
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        if (this.getLoadComplete ()) {
            return this.m_data;
        } else {
            return null;
        }
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();

        if (this.getResource () != null) {
            // destroy
        } else {
            console.log (": error: ", this.m_path);
        }
    }

//------------------------------------------------------------------------------------------
}