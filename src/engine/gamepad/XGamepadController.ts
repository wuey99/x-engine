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
import { XSignal } from "../signals/XSignal";
import { XType } from "../type/XType";
import { XGamepad } from "./XGamepad";
import { XGamepadAxis } from "./XGamepad";
import { XGamepadButton } from "./XGamepad";

//------------------------------------------------------------------------------------------
export class XGamepadController {
	m_buttonUpSignals: Map<XGamepadButton, XSignal>;
	m_buttonDownSignals: Map<XGamepadButton, XSignal>;
	m_axisChangedSignals: Map<XGamepadAxis, XSignal>;

//------------------------------------------------------------------------------------------	
	constructor () {
	}

//------------------------------------------------------------------------------------------
	public setup ():void {
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		this.removeAllListeners ();
	}

//------------------------------------------------------------------------------------------
	public removeAllListeners ():void {
		XType.forEach (this.m_axisChangedSignals, 
			(__axis:XGamepadAxis) => {
				this.m_axisChangedSignals.get (__axis).removeAllListeners ();
			}
		);
			
		XType.forEach (this.m_buttonUpSignals, 
			(__button:XGamepadButton) => {
				this.m_buttonUpSignals.get (__button).removeAllListeners ();
			}
		);
			
		XType.forEach (this.m_buttonDownSignals, 
			(__button:XGamepadButton) => {
				this.m_buttonDownSignals.get (__button).removeAllListeners ();
			}
		);
	}

//------------------------------------------------------------------------------------------
	public process (__gamepadX:XGamepad):void {
		if (__gamepadX) {
			let __changes = __gamepadX.process ();

			if (__changes.buttonsDown.length > 0 || __changes.buttonsUp.length > 0 || __changes.axisValuesChanged.length > 0) {
				console.log (": changes: ", __changes);
			}
		}
	}

//------------------------------------------------------------------------------------------
// AXIS
//------------------------------------------------------------------------------------------
		
//------------------------------------------------------------------------------------------
	public getAxisChangedSignal (__axis:XGamepadAxis):XSignal {
		if (!this.m_axisChangedSignals.has (__axis)) {
			this.m_axisChangedSignals.set (__axis, new XSignal ());
		}
			
		return this.m_axisChangedSignals.get (__axis);
	}

//------------------------------------------------------------------------------------------
	public addAxisChangedListener (__axis:XGamepadAxis, __listener:any):number {
		 return this.getAxisChangedSignal (__axis).addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeAxisChangedListener (__axis:XGamepadAxis, __id:number):void {	
		this.getAxisChangedSignal (__axis).removeListener (__id);
	}

//------------------------------------------------------------------------------------------
// BUTTON UP
//------------------------------------------------------------------------------------------
		
//------------------------------------------------------------------------------------------
	public getButtonUpSignal (__button:XGamepadButton):XSignal {
		if (!this.m_buttonUpSignals.has (__button)) {
			this.m_buttonUpSignals.set (__button, new XSignal ());
		}
			
		return this.m_buttonUpSignals.get (__button);			
	}
		
//------------------------------------------------------------------------------------------
	public addButtonUpListener (__button:XGamepadButton, __listener:any):number {
		return this.getButtonUpSignal (__button).addListener (__listener);
	}
	
//------------------------------------------------------------------------------------------
	public removeButtonUpListener (__button:XGamepadButton, __id:number):void {	
		this.getButtonDownSignal (__button).removeListener (__id);
	}
		
//------------------------------------------------------------------------------------------
// BUTTON DOWN
//------------------------------------------------------------------------------------------
		
//------------------------------------------------------------------------------------------
	public getButtonDownSignal (__button:XGamepadButton):XSignal {
		if (!this.m_buttonDownSignals.has (__button)) {
			this.m_buttonDownSignals.set (__button, new XSignal ());
		}
			
		return this.m_buttonDownSignals.get (__button);				
	}
				
//------------------------------------------------------------------------------------------
	public addButtonDownListener (__button:XGamepadButton, __listener:any):number {
		return this.getButtonDownSignal (__button).addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public removeButtonDownListener (__button:XGamepadButton, __id:number):void {
		this.getButtonDownSignal (__button).removeListener (__id);
	}
}