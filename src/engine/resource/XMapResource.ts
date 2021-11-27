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
import { XApp } from "../app/XApp";
import { Resource } from './Resource';
import { G } from '../app/G';
const pako = require('pako');

//------------------------------------------------------------------------------------------
export class XMapResource extends Resource {

    //------------------------------------------------------------------------------------------		
    constructor () {
        super ();
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
        if (this.m_path in this.loader.resources) {
            this.m_loadComplete = true;
            
            return;
        }

		this.loader.add (this.m_path, {xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.BUFFER}).load (() => {
            // console.log (": BlobResource: loadComplete: ", this);

            if (this.m_isDead) {
                console.log (": isDead: ", this.m_path);

                if (this.getResource () != null) {
                    // destroy
                }
            } else {
                this.m_loadComplete = true;
            }
        });

        this.loader.onError.add (() => {
        });
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        if (this.getLoadComplete ()) {
            var __levelZLib:any = this.loader.resources[this.m_path].data;
            var __levelXMLArray:Uint8Array = pako.inflate (__levelZLib);
            var __levelXMLString:string =  new TextDecoder ().decode (__levelXMLArray);

            return __levelXMLString;
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