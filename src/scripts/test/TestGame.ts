//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
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
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { OctopusBug } from './OctopusBug';
import { GUID } from '../../engine/utils/GUID';
import { FlockLeader } from './FlockLeader';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import * as SFS2X from "sfs2x-api";
import { SFSConnectionManager } from '../../engine/sfs/SFSConnectionManager';

//------------------------------------------------------------------------------------------
export class TestGame extends XState {

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

		var __sfs:SFSConnectionManager = SFSConnectionManager.instance ().setup ();

		__sfs.addConnectedistener (() => {
			console.log (": connected to smartfox server: ");
		});

		__sfs.addDisconnectedistener (() => {
			console.log (": disconnected from smartfox server: ");
		});

		__sfs.addErrorListener ((__error:string) => {
			console.log (": error connecting to smartfox server: ", __error);
		});

		__sfs.connect ();

		var __leader:FlockLeader = world.addGameObject (FlockLeader, 0, 0.0, false) as FlockLeader;
		__leader.afterSetup ();
		
		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}