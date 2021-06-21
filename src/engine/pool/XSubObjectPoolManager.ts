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
    import { XType } from '../type/XType'; 
    import { XObjectPoolManager } from './XObjectPoolManager';
    
//------------------------------------------------------------------------------------------	
	export class XSubObjectPoolManager {
		private m_manager:XObjectPoolManager;
		private m_inuseObjects:Map<any, number>;
		
//------------------------------------------------------------------------------------------
		constructor (__manager:XObjectPoolManager) {
			this.m_manager = __manager;
			
			this.m_inuseObjects = new Map<any, number> ();
		}
		
//------------------------------------------------------------------------------------------
		public isObject (__object:any):boolean {
			return this.m_manager.isObject (__object);
		}	

//------------------------------------------------------------------------------------------
		public getObjects ():Map<any, number> {
			return this.m_manager.getObjects ();
		}

//------------------------------------------------------------------------------------------
		public returnAllObjects ():void {
			XType.forEach (this.m_inuseObjects, 
				(__object:any) => {
					this.returnObject (__object);
				}
			);
		}		
		
//------------------------------------------------------------------------------------------
		public returnObject (__object:any):void {
			if (this.m_inuseObjects.has (__object)) {
				this.m_manager.returnObject (__object);
				
				this.m_inuseObjects.delete (__object);
			}
		}

//------------------------------------------------------------------------------------------
		public borrowObject ():any {
			var __object:any = this.m_manager.borrowObject ();
				
			this.m_inuseObjects.set (__object, 0);
			
			return __object;
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
