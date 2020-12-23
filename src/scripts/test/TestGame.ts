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
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XButton } from '../../engine/ui/XButton';

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

		SFSManager.instance ().setup ();

		SFSManager.instance ().connect (
			"127.0.0.1", 8080,
			(e:SFS2X.SFSEvent) => {
				console.log (": ----------------->: connected: ");
			},
			(e:SFS2X.SFSEvent) => {
				console.log (": ----------------->: disconnected: ");
			}
		);

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (
						SFSManager.instance ().isConnected ()
					);
				}, XTask.BNE, "loop",

				() => {
					console.log (": connected: ");

					SFSManager.instance ().send (new SFS2X.LoginRequest("FozzieTheBear", "", null, "BasicExamples"));
					SFSManager.instance ().once (SFS2X.SFSEvent.LOGIN, (e:SFS2X.SFSEvent) => {
						console.log (": logged in: ", e);
					});
					SFSManager.instance ().once (SFS2X.LOGIN_ERROR, (e:SFS2X.SFSEvent) => {
						console.log (": login error: ", e);
					});
				},

				XTask.RETN,
			]);

		var __leader:FlockLeader = world.addGameObject (FlockLeader, 0, 0.0, false) as FlockLeader;
		__leader.afterSetup ([]);

		var __testButton:XButton = this.addGameObjectAsChild (XButton, 0, 0.0, false) as XButton;
		__testButton.afterSetup (["TestButton"]);
		__testButton.x = 256;
		__testButton.y = 256;

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}