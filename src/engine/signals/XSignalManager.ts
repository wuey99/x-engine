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
import { XApp } from '../app/XApp';
import { XSignal } from './XSignal';

//------------------------------------------------------------------------------------------	
	export class XSignalManager {
		// private m_XApp:XApp;
		
		private m_XSignals:Map<XSignal, number>;
		
//------------------------------------------------------------------------------------------
		constructor (__XApp:XApp) {
			// this.m_XApp = __XApp;
			
			this.m_XSignals = new Map<XSignal, number> ();
		}

//------------------------------------------------------------------------------------------
		public isXSignal (__signal:XSignal):boolean {
			return this.m_XSignals.has (__signal);
		}	

//------------------------------------------------------------------------------------------
		public getXSignals ():Map<XSignal, number> {
			return this.m_XSignals;
		}

//------------------------------------------------------------------------------------------
		public removeAllXSignals ():void {
            var __signal:XSignal;

			for (__signal of this.m_XSignals.keys ()) {
				this.removeXSignal (__signal);
			}
		}		
		
//------------------------------------------------------------------------------------------
		public removeXSignal (__signal:XSignal):void {
			if (this.m_XSignals.has (__signal)) {
				__signal.removeAllListeners ();
				
				this.m_XSignals.delete (__signal);
			}
		}

//------------------------------------------------------------------------------------------
		public createXSignal ():XSignal {
			var __signal:XSignal = new XSignal ();
			
			__signal.setParent (this);
			
			this.m_XSignals.set (__signal, 0);
			
			return __signal;	
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
