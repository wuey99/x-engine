//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014 Jimmy Huey (wuey99@gmail.com)
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
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { XState } from '../state/XState';
import { XGameController } from '../state/XGameController';
import { XSoundManager } from '../sound/XSoundManager';
import { XSoundSubManager } from '../sound/XSoundSubManager';
import { G } from '../app/G';
import { XLevel } from '../level/XLevel';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XMickey } from "../level/XMickey";
import { XGameInstance } from '../state/XGameInstance';
import { XMapItemModel } from '../xmap/XMapItemModel';
import { ZoneX } from '../zone/ZoneX';
import { ZoneManager } from '../zone/ZoneManager';
	
//------------------------------------------------------------------------------------------	
	export class XLogicManager {
		private world:XWorld;
		private m_XApp:XApp;
		
//------------------------------------------------------------------------------------------
		public constructor (__XApp:XApp, __world:XWorld) {
			this.world = __world;
            this.m_XApp = __XApp;
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}
		
//------------------------------------------------------------------------------------------
		public createXLogicObjectFromClassName (
			__parent:XGameObject,
			__className:string,
			__item:XMapItemModel, __layer:number, __depth:number,
			__x:number, __y:number, __z:number, 
			__scale:number, __rotation:number,
			args:Array<any> = null
			):XGameObject {
				
			args = (args == null) ? args = [] : args;
			
			var __class:any = this.m_XApp.getClass (__className);
			
			var __logicObject:XGameObject = XType.createInstance (__class) as XGameObject;
				
			return this.__initXLogicObject (
				__parent,
				__logicObject,
				null,
				__item, __layer, __depth,
				__x, __y, __z,
				__scale, __rotation,
				args);
		}
		
//------------------------------------------------------------------------------------------
		public initXLogicObjectFromPool (
			__parent:XGameObject,
			__class:any,
			__item:XMapItemModel, __layer:number, __depth:number,
			__x:number, __y:number, __z:number, 
			__scale:number, __rotation:number,
			args:Array<any> = null
		):XGameObject {
			
			args = (args == null) ? args = [] : args;
			
			var __logicObject:XGameObject = this.world.getXLogicObjectPoolManager ().borrowObject (__class) as XGameObject;
			
			return this.__initXLogicObject (
				__parent,
				__logicObject,
				__class,
				__item, __layer, __depth,
				__x, __y, __z,
				__scale, __rotation,
				args);
		}
	
//------------------------------------------------------------------------------------------
		public initXLogicObject (
			__parent:XGameObject,
			__logicObject:XGameObject,
			__item:XMapItemModel, __layer:number, __depth:number,
			__x:number, __y:number, __z:number, 
			__scale:number, __rotation:number,
			args:Array<any> = null
			):XGameObject {

			args = (args == null) ? args = [] : args;
			
			return this.__initXLogicObject (
					__parent,
					__logicObject,
					null,
					__item, __layer, __depth,
					__x, __y, __z,
					__scale, __rotation,
					args
				);
		}			
//------------------------------------------------------------------------------------------
		public __initXLogicObject (
			__parent:XGameObject,
			__logicObject:XGameObject,
			__class:any,
			__item:XMapItemModel, __layer:number, __depth:number,
			__x:number, __y:number, __z:number, 
			__scale:number, __rotation:number,
			args:Array<any> = null
			):XGameObject {

			__logicObject.setDepth (__depth);
			__logicObject.setLayer (__layer);
													
			__logicObject.$setup (this.world, args);

			__logicObject.setItem (__item);
			__logicObject.oX = __x;
			__logicObject.oY = __y;
			__logicObject.setScale (__scale);
			__logicObject.setRotation (__rotation);
			__logicObject.setParentObject (__parent);
			__logicObject.oAlpha = 1.0;
			
			if (__class != null) {
				__logicObject.setPoolClass (__class);
			}
			
			__logicObject.$setupX ();
						
			if (__parent == null) {
				// m_XLogicObjectsTopLevel.set (__logicObject, 0);
			}
			
			return __logicObject;
		}
		
//------------------------------------------------------------------------------------------
	}

//------------------------------------------------------------------------------------------
// }
