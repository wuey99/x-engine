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
	export class XSignal {
		public m_listeners:Map<number, any>;
		public m_parent:any
		public m_id:number;
		
//------------------------------------------------------------------------------------------
		constructor () {
			this.m_listeners = new Map<number, any> ();
			this.m_id = 0;
		}

//------------------------------------------------------------------------------------------
		public getParent ():any {
			return this.m_parent;
		}
		
//------------------------------------------------------------------------------------------
		public setParent (__parent:any):void {
			this.m_parent = __parent;
		}
		
//------------------------------------------------------------------------------------------
		public addListener (__listener:any):number {
			this.m_listeners.set (++this.m_id, __listener);
			
			return this.m_id;
		}

//------------------------------------------------------------------------------------------
		public fireSignal (...args:any):void {
            var __listener:any;
            var __id:number;

			switch (args.length) {
				case 0:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener ();
                    }
                    
                    break;
				case 1:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener (args[0]);
					}
        
                    break;
				case 2:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener (args[0], args[1]);
					}
        
                    break;
				case 3:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener (args[0], args[1], args[2]);
					}
        
                    break;
				case 4:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener (args[0], args[1], args[2], args[3]);
                    }
                    
                    break;
			}
		}
		
//------------------------------------------------------------------------------------------
		public removeListener (__id:number):void {
			if (this.m_listeners.has (__id)) {
				this.m_listeners.delete (__id);
			}
		}

//------------------------------------------------------------------------------------------
		public removeAllListeners ():void {
            var __id:number;

			for (__id of this.m_listeners.keys ()) {
				this.m_listeners.delete (__id);
			}
		}
				
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }