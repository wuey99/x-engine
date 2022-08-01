//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
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
import { TextInput } from 'pixi-textinput-v5';
import { XLevel } from '../../engine/level/XLevel';

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

		console.log (": Test001: ", this.m_XApp.getResourceByName ("Test001"));

		var __level:XLevel = this.addGameObjectAsChild (XLevel, 0, 0.0, false) as XLevel;
		var __levelXML:XSimpleXMLNode = new XSimpleXMLNode (this.m_XApp.getResourceByName ("Test001"));
		__level.afterSetup ([__levelXML]);

		this.world.replaceLayer (1, new XSpriteLayer0 ());

		__level.x = 0;
		__level.y = 0;

		var __x:number = 0;
		var __y:number = 0;
		
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

		var __leader:FlockLeader = world.addGameObject (FlockLeader, TestGame.HUD_LAYER, 0.0, false) as FlockLeader;
		__leader.afterSetup ([]);

		var __testButton:XSpriteButton = this.addGameObjectAsChild (XSpriteButton, TestGame.HUD_LAYER, 0.0, false) as XSpriteButton;
		__testButton.afterSetup ([
			"TestButton",
			true, 10, 250, 50
		]);
		__testButton.x = 256;
		__testButton.y = 256;

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
		__testButton3.x = 2732 - 260;
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

		var __textInput:TextInput = new TextInput (
			{
				input: {fontSize: '60px'}, 
				box: {fill: 0xEEEEEE}
			}
		);
		this.addSortableChild (__textInput, TestGame.HUD_LAYER, 0.0, true);
		__textInput.x = 1024;
		__textInput.y = 768;
	
		/*
		var __octopusBugX:OctopusBugX = this.addGameObjectAsChild (OctopusBugX, TestGame.HUD_LAYER, 999999.0, false) as OctopusBugX;
		__octopusBugX.afterSetup ([]);
		__octopusBugX.x = 512;
		__octopusBugX.y = 512;
		*/
		
		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}