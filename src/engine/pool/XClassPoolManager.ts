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
	export class XClassPoolManager {
		private m_pools:Map<any, XObjectPoolManager>;
		
//------------------------------------------------------------------------------------------
		constructor () {
			this.m_pools = new Map<any, XObjectPoolManager> ();
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}

//------------------------------------------------------------------------------------------
		public setupPool (
			__class:any,
			__numObjects:number,
			__overflow:number
		):XObjectPoolManager {
			
			return new XObjectPoolManager (
				():any => {
					return XType.createInstance (__class);
				},
				
				(__src:any, __dst:any):any => {
					return null;
				},
				
				__numObjects, __overflow,
				
				(x:any):void => {

				}
			);
		}

//------------------------------------------------------------------------------------------
		public preAllocate (__class:any, __numObjects:number):void {
			var __pool:XObjectPoolManager;
			
			if (!this.m_pools.has (__class)) {
				__pool = this.setupPool (__class, 16, 16);
				
				this.m_pools.set (__class, __pool);
			}	
			
			__pool = this.m_pools.get (__class);
			
			var i:number;
			
			for (i = 0; i < __numObjects; i++) {
				__pool.borrowObject ();
			}
			
			this.returnAllObjects (__class);
		}
		
//------------------------------------------------------------------------------------------
		public returnAllObjects (__class:any = null):void {
			var __pool:XObjectPoolManager;
			
			if (__class != null) {
				if (this.m_pools.has (__class)) {
					__pool = this.m_pools.get (__class);
					
					__pool.returnAllObjects ();
				}
            } else {
				XType.forEach (this.m_pools, 
					(x:any):void => {
						__pool = this.m_pools.get (__class);
						
						__pool.returnAllObjects ();
					}
				);
			}
		}		
		
//------------------------------------------------------------------------------------------
		public returnObject (__class:any, __object:any):void {
			var __pool:XObjectPoolManager;
			
			if (this.m_pools.has (__class)) {
				__pool = this.m_pools.get (__class);
				
				__pool.returnObject (__object);
			}
		}

//------------------------------------------------------------------------------------------
		public borrowObject (__class:any):any {
			var __pool:XObjectPoolManager;
			
			if (!this.m_pools.has (__class)) {
				__pool = this.setupPool (__class, 16, 16);
				
				this.m_pools.set (__class, __pool);
			}
			else
			{
				__pool = this.m_pools.get (__class);
			}
			
			return __pool.borrowObject ();
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
