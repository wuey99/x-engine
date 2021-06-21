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
import { XApp } from '../app/XApp';
import { XGameObject} from '../gameobject/XGameObject';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class PausableListener {
	public m_gameObject:XGameObject;
    public m_eventName:string;
    public m_displayObject:PIXI.DisplayObject;
	public m_listener:any;
	public boundListener:any;

	//------------------------------------------------------------------------------------------
	constructor (__gameObject:XGameObject, __eventName:string, __displayObject:PIXI.DisplayObject, __listener:any) {
		this.m_gameObject = __gameObject;
        this.m_eventName = __eventName;
        this.m_displayObject = __displayObject;
		this.m_listener = __listener;

		this.m_displayObject.on (__eventName, this.boundListener = this.__listener.bind (this));
	}

	//------------------------------------------------------------------------------------------
	public cleanup ():void {
		this.m_displayObject.off (this.m_eventName, this.boundListener);
	}

	//------------------------------------------------------------------------------------------
	private __listener (e:PIXI.InteractionEvent):void {
		if (!XGameObject.getXApp ().isPaused () && this.m_gameObject.getMasterMouseEnabled ()) {
			this.m_listener (e);
		}
	}

//------------------------------------------------------------------------------------------
}