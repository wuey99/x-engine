//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XDepthSprite} from '../../engine/sprite/XDepthSprite';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { OctopusBug } from './OctopusBug';
import { GUID } from '../../engine/utils/GUID';
import { FlockLeader } from './FlockLeader';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';

//------------------------------------------------------------------------------------------
export class TestSVG extends XState {

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);

        console.log (": guid: ", GUID.create ());
		
		this.addTask ([
			() => {
				this.m_XApp.getXProjectManager ().loadResources ([
					{
						name: "Earth_Layers_BackgroundX",
						type: "ImageResource",
						path: "backgrounds/Earth/earth-layers-background.svg"
					}
				]);
			},

			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (this.m_XApp.getXProjectManager ().getResourceManager ().getLoadComplete ());
				}, XTask.BNE, "loop",

				() => {
					var __background:XGameObject = this.addGameObjectAsChild (XGameObject, 0, 0.0, true);
					__background.addSortableChild (
						__background.afterSetup ().createSprite ("Earth_Layers_BackgroundX"),
						0, 0.0, true
					);
				},

			XTask.RETN,
		]);

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}