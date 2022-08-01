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
    import { XTask } from './XTask';
    import { XObjectPoolManager } from '../pool/XObjectPoolManager';

//------------------------------------------------------------------------------------------	
	export class XTaskManager {
		private m_XTasks:Map<XTask, number>;
		private m_paused:number;
		private m_XApp:XApp;
		private m_poolManager:XObjectPoolManager;
		
//------------------------------------------------------------------------------------------
		constructor (__XApp:XApp) {
			this.m_XApp = __XApp;
			
			this.m_XTasks = new Map<XTask, number> ();
			
			this.m_paused = 0;
			
			this.m_poolManager = this.createPoolManager ();
		}
		
//------------------------------------------------------------------------------------------	
		public cleanup ():void {
			this.m_poolManager.returnAllObjects ();
			
			this.m_poolManager = null;
		}
		
//------------------------------------------------------------------------------------------	
		public createPoolManager ():XObjectPoolManager {
			return new XObjectPoolManager (
				():any => {
					return new XTask ();
				},
					
				(__src:any, __dst:any):any => {
					return null;
				},
					
				8192, 256,
					
				(x:any):void => {
				}
			);
        }

//------------------------------------------------------------------------------------------
		public getXApp ():XApp {
			return this.m_XApp;
		}
		
//------------------------------------------------------------------------------------------
		public pause ():void {
			this.m_paused++;
		}
		
//------------------------------------------------------------------------------------------
		public unpause ():void {
			this.m_paused--;
		}

//------------------------------------------------------------------------------------------
		public isTask (__task:XTask):boolean {
			return this.m_XTasks.has (__task);
		}	

//------------------------------------------------------------------------------------------
		public getTasks ():Map<XTask, number> {
			return this.m_XTasks;
		}

//------------------------------------------------------------------------------------------
		public removeAllTasks ():void {
            var __task:XTask;

            for (__task of this.m_XTasks.keys ()) {
                this.removeTask (__task);
			}
		}		
		
//------------------------------------------------------------------------------------------
		public addTask (__taskList:Array<any>, __findLabelsFlag:boolean = false):XTask {
            var __task:XTask = this.m_poolManager.borrowObject () as XTask;
			// var __task:XTask = new XTask ();
			__task.setup (__taskList, __findLabelsFlag);
			
			__task.setManager (this);
			__task.setParent (this);
			
			this.m_XTasks.set (__task, 0);
			
			return __task;
		}

//------------------------------------------------------------------------------------------
		public addXTask (__task:XTask):XTask {
			__task.setManager (this);
			__task.setParent (this);
			
			this.m_XTasks.set (__task, 0);
			
			return __task;
		}
		
//------------------------------------------------------------------------------------------
		public removeTask (__task:XTask):void {
			if (this.m_XTasks.has (__task)) {
				__task.kill ();
				
				this.m_poolManager.returnObject (__task);
				
				this.m_XTasks.delete (__task);
			}
		}
		
//------------------------------------------------------------------------------------------
		public updateTasks ():void {	
			if (this.m_paused > 0) {
				return;
			}

            var __task:XTask;

            for (__task of this.m_XTasks.keys ()) {
				__task.run ();
			}
		}

//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
