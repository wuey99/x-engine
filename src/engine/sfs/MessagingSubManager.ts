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
import { MessagingManager } from './MessagingManager';

//------------------------------------------------------------------------------------------	
	export class MessagingSubManager {	
		public m_readySignals:Map<number, number>;
		public m_completeSignals:Map<number, number>;
		public m_triggerSignals:Map<number, string>;
		public m_sceneChangeSignals:Map<number, number>;
		
//------------------------------------------------------------------------------------------
		constructor () {		
			this.m_readySignals = new Map<number, number> ();
			this.m_completeSignals = new Map<number, number> ();
			this.m_triggerSignals = new Map<number, string> ();
			this.m_sceneChangeSignals = new Map<number, number> ();
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
            var __id:number;

			for (__id of this.m_readySignals.keys ()) {
				this.removeReadyListener (this.m_readySignals.get (__id), __id);
			}

			for (__id of this.m_completeSignals.keys ()) {
				this.removeCompleteListener (this.m_completeSignals.get (__id), __id);
			}

			for (__id of this.m_triggerSignals.keys ()) {
				this.removeTriggerListener (this.m_triggerSignals.get (__id), __id);
			}

			for (__id of this.m_sceneChangeSignals.keys ()) {
				this.removeSceneChangeListener (this.m_sceneChangeSignals.get (__id), __id);
			}
		}		

//------------------------------------------------------------------------------------------
		public addReadyListener (__userId:number, __listener:any):number {
			var __id:number = MessagingManager.instance ().addReadyListener (__userId, __listener);

			this.m_readySignals.set (__id, __userId);
		
			return __id;
		}

//------------------------------------------------------------------------------------------
		public removeReadyListener (__userId:number, __id:number):void {
			if (this.m_readySignals.has (__id)) {
				MessagingManager.instance ().removeReadyListener (__userId, __id);

				this.m_readySignals.delete (__id);
			}
		}

//------------------------------------------------------------------------------------------
		public addCompleteListener (__userId:number, __listener:any):number {
			var __id:number = MessagingManager.instance ().addCompleteListener (__userId, __listener);

			this.m_completeSignals.set (__id, __userId);

			return __id;
		}

//------------------------------------------------------------------------------------------
		public removeCompleteListener (__userId:number, __id:number):void {
			if (this.m_completeSignals.has (__id)) {
				MessagingManager.instance ().removeCompleteListener (__userId, __id);

				this.m_completeSignals.delete (__id);
			}
		}

//------------------------------------------------------------------------------------------
		public addTriggerListener (__userId:number, __triggerName:string, __listener:any):number {
			var __id:number = MessagingManager.instance ().addTriggerListener (__userId, __triggerName, __listener);

			this.m_triggerSignals.set (__id, __triggerName + __userId);

			return __id;
		}

//------------------------------------------------------------------------------------------
		public removeTriggerListener  (__triggerID:string, __id:number):void {
			if (this.m_triggerSignals.has (__id)) {
				MessagingManager.instance ().removeTriggerListener (__triggerID, __id);

				this.m_triggerSignals.delete (__id);
			}
		}

//------------------------------------------------------------------------------------------
		public addSceneChangeListener (__userId:number, __listener:any):number {
			var __id:number = MessagingManager.instance ().addSceneChangeListener (__userId, __listener);

			this.m_sceneChangeSignals.set (__id, __userId);

			return __id;
		}

//------------------------------------------------------------------------------------------
		public removeSceneChangeListener  (__userId:number, __id:number):void {
			if (this.m_sceneChangeSignals.has (__id)) {
				MessagingManager.instance ().removeSceneChangeListener (__userId, __id);

				this.m_sceneChangeSignals.delete (__id);
			}
		}

//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
