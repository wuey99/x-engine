//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { Assets, LoaderParser } from 'pixi.js';
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSpriteLayer0 } from '../../engine/sprite/XSpriteLayer0';
import { XSpriteLayer9 } from '../../engine/sprite/XSpriteLayer9';
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
import { OctopusBugX } from './OctopusBugX';
import { GUID } from '../../engine/utils/GUID';
import { FlockLeader } from './FlockLeader';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XSpriteButton } from '../../engine/ui/XSpriteButton';
import { XTextButton } from '../../engine/ui/XTextButton';
import { XTextSpriteButton } from '../../engine/ui/XTextSpriteButton';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { XLevel } from '../../engine/level/XLevel';
import { XProcess } from '../../engine/process/XProcess';
import { XType } from '../../engine/type/XType';

//------------------------------------------------------------------------------------------
export class TestGame extends XState {
	public static HUD_LAYER:number = 7;

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

		var __level:XLevel = this.addGameObjectAsChild (XLevel, 0, 0.0, false) as XLevel;
		var __levelXML:XSimpleXMLNode = new XSimpleXMLNode (this.m_XApp.getResourceByName ("Test001"));
		__level.afterSetup ([__levelXML]);

		// TODO
		// this.world.replaceLayer (1, new XSpriteLayer0 ());

		__level.x = 0;
		__level.y = 0;

		var __x:number = 0;
		var __y:number = 0;

		var __process:XProcess = this.addProcess (this.tick.bind (this));
	
		/*
		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,
				
				XTask.FLAGS, (__task:XTask) => {
					__level.scrollTo (0, -__x, -__y);
					__level.scrollTo (1, -__x, -__y);
					__level.updateScroll ();
					__level.updateFromXMapModel ();
					__x += 1;
					__y += 1;

					__task.ifTrue (__x == 1536);
				}, XTask.BNE, "loop",

				// XTask.GOTO, "loop",

			XTask.RETN,
		]);
		*/

		this.addProcess (
			function * () {
				do {
					yield [XProcess.WAIT, 0x0100];

					__level.scrollTo (0, -__x, -__y);
					__level.scrollTo (1, -__x, -__y);
					__level.updateScroll ();
					__level.updateFromXMapModel ();
					__x += 1;
					__y += 1;
				} while (__x != 1536);
			}.bind (this)
		);

		var __leader:FlockLeader = world.addGameObject (FlockLeader, TestGame.HUD_LAYER, 0.0, false) as FlockLeader;
		__leader.afterSetup ([]);

		Assets.load ("assets/Common.xml").then ((__data:any) => {
			var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
            __xml.setupWithXMLString (JSON.stringify (__data));

			console.log (": xml: ", __xml);
		});

		var __testButton:XSpriteButton = this.addGameObjectAsChild (XSpriteButton, TestGame.HUD_LAYER, 0.0, false) as XSpriteButton;
		__testButton.afterSetup ([
			"TestButton",
			true, 10, 250, 50
		]);
		__testButton.x = 750;
		__testButton.y = 500;

		this.createBitmapFont (
            "Aller",
            {
                fontFamily: "Nunito",
                fontSize: 60,
                strokeThickness: 0,
                fill: "0xffffff",         
            },
            {chars: this.getBitmapFontChars ()}
		);

		var __testButton2:XTextButton = this.addGameObjectAsChild (XTextButton, TestGame.HUD_LAYER, 0.0, false) as XTextButton;
		__testButton2.afterSetup ([
			120,
			64,
			"press me",
			"Aller",
			100,
			0x0000ff,
			0xff0000,
			0x00ff00,
			0x0000ff,
			0x0000ff,
			false,
			"center", "center"
		]);
		__testButton2.x = 512;
		__testButton2.y = 512;
		
		var __testButton3:XTextSpriteButton = this.addGameObjectAsChild (XTextSpriteButton, TestGame.HUD_LAYER, 0.0, false) as XTextSpriteButton;
		__testButton3.afterSetup ([
			"TestButtonToo",
			true, 10, 300, 100,
			"press me",
			"Aller",
			50,
			0x0000ff,
			0xff0000,
			0x00ff00,
			0x0000ff,
			0x0000ff,
			false,
			"center", "center"
		]);
		__testButton3.x = 2732 - 512;
		__testButton3.y = 512;

		var __textSprite:XTextSprite = this.createXTextSprite (
			120,
			64,
			"hello world",
			"Aller",
			100,
			0xff0000,
			true,
			"center", "center"
		);
		this.addSortableChild (__textSprite, TestGame.HUD_LAYER, 0.0, true);
		__textSprite.x = 256;
		__textSprite.y = 256;
	
		/*
		var __octopusBugX:OctopusBugX = this.addGameObjectAsChild (OctopusBugX, TestGame.HUD_LAYER, 999999.0, false) as OctopusBugX;
		__octopusBugX.afterSetup ([]);
		__octopusBugX.x = 512;
		__octopusBugX.y = 512;
		*/
		
		return this;
	}

//------------------------------------------------------------------------------------------
	public *tick () {
		while (true) {
			console.log (": tick: ", this);

			yield [XProcess.EXEC, this.subTick.bind (this)];

			yield [XProcess.WAIT1000, 1 * 1000];
		}
	}

//------------------------------------------------------------------------------------------
	public *subTick () {
		console.log (": subTick: ", this);

		yield [XProcess.WAIT, 0x0800];
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}