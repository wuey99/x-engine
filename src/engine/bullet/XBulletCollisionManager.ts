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
import * as PIXI from 'pixi.js'
import { XPoint } from '../geom/XPoint';
import { XRect } from '../geom/XRect';
import { XWorld} from '../sprite/XWorld';
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { XSubObjectPoolManager } from '../pool/XSubObjectPoolManager';
import { XBulletCollisionList } from './XBulletCollisionList';
	
//------------------------------------------------------------------------------------------
	export class XBulletCollisionManager {
		private xxx:XWorld;
		private m_collisionLists:Map<XBulletCollisionList, number>;
		
//------------------------------------------------------------------------------------------
		constructor (__xxx:XWorld) {
			this.xxx = __xxx;
			
			this.m_collisionLists = new Map<XBulletCollisionList, number> ()
		}
		
//------------------------------------------------------------------------------------------
		public setup ():void {
		}
		
//------------------------------------------------------------------------------------------
		public cleanup ():void {
			this.removeAllCollisionLists ();
		}
		
//------------------------------------------------------------------------------------------
		public clearCollisions ():void {
			XType.forEach (this.m_collisionLists, 
				function (x:XBulletCollisionList):void {
					var __collisionList:XBulletCollisionList = x;
					
					__collisionList.clear ();
				}
			);
		}
	
//------------------------------------------------------------------------------------------
		public addCollisionList ():XBulletCollisionList {
			var __collisionList:XBulletCollisionList = new XBulletCollisionList ();
			
			__collisionList.setup (this.xxx);
			
			this.m_collisionLists.set (__collisionList, 0);
			
			return __collisionList;
		}

//------------------------------------------------------------------------------------------
		public removeCollisionList (__collisionList:XBulletCollisionList):void {
			__collisionList.cleanup ();
			
			this.m_collisionLists.delete (__collisionList);
		}
		
//------------------------------------------------------------------------------------------
		public removeAllCollisionLists ():void {
			XType.forEach (this.m_collisionLists, 
				(x:XBulletCollisionList):void => {
					var __collisionList:XBulletCollisionList = x;
					
					__collisionList.cleanup ();
					
					this.m_collisionLists.delete (x);
				}
			);			
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
