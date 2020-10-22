//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XGameObject} from '../gameobject/XGameObject';
import { XState } from '../state/XState';
import { OctopusBug } from './OctopusBug';
import { GUID } from '../utils/GUID';
import { FlockLeader } from './FlockLeader';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';

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
		
        var __loader:PIXI.Loader = new PIXI.Loader ();

		var __path:string = "backgrounds/earth-layers-background.svg";

        __loader.add(__path).load ((loader, resources) => {
			console.log (": load svg: ", resources[__path].texture);

			let sprite = new PIXI.Sprite (resources[__path].texture);
			this.addSortableChild (sprite, 0, 0.0, true);
		});

		/*
		var __background:XGameObject = this.addGameObjectAsChild (XGameObject, 0, 0.0, true);
		__background.addSortableChild (
			__background.afterSetup ().createSpriteFromSVG ("backgrounds/earth-layers-background.svg"),
			0, 0.0, true
		);

		this.addSortableChild (__background, 0, 0.0, true);
		*/

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}