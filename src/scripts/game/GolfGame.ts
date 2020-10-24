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
import { XType } from '../type/Xtype';
import { XGameObject} from '../gameobject/XGameObject';
import { TerrainContainer } from '../terrain/TerrainContainer';
import { XState } from '../state/XState';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { ForceVector } from './ForceVector';
import { GolfBall } from './GolfBall';
import * as Matter from 'matter-js';
import {Howl, Howler} from 'howler';
import { SidePanel } from './SidePanel';

//------------------------------------------------------------------------------------------
export class GolfGame extends XState {
	public m_terrainContainer:TerrainContainer;
	public m_loadComplete:boolean;
	public loader:PIXI.Loader;
	public m_levelXML:XSimpleXMLNode;
	public m_forceVector:ForceVector;
	public m_golfBall:GolfBall;
	public m_sidePanel:SidePanel;
	public m_worldName:string;

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

		console.log (": GolfGame: ");

		this.loadLevel ("levels\\TestLevel.xml");

		var sound = new Howl ({
			src: ['sounds\\Sergey_Cheremisinov_-_04_-_Northern_Lullaby.mp3']
		});
		  
		sound.play ();

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (
						this.m_loadComplete &&
						this.m_XApp.getXProjectManager ().getResourceManager ().getLoadComplete ()
					);
				}, XTask.BNE, "loop",

				() => {
					this.startGame ("Earth");
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
	public startGame (__worldName:string):void {
		this.m_worldName = __worldName;

		this.createTerrainContainer ().deserialize (this.m_levelXML);

		this.m_golfBall = this.m_terrainContainer.addGameObjectAsChild (GolfBall, 0, 0.0, false) as GolfBall;
		this.m_golfBall.afterSetup ([this.m_terrainContainer, this.m_worldName, false])
			.attachMatterBodyCircle (Matter.Bodies.circle (512, 256, 22, {restitution: 0.80}), 22)
			.setMatterRotate (false);

		this.m_XApp.getStage ().on ("mousedown", this.onMouseDown.bind (this));

		this.createSidePanel ();
	}

//------------------------------------------------------------------------------------------
	public createSidePanel ():void {
        PIXI.BitmapFont.from("SidePanelLabelFont", {
			fontFamily: "Arial",
			fontSize: 40,
			strokeThickness: 0,
			fill: "white"
		});
	   
        PIXI.BitmapFont.from("SidePanelSmallLabelFont", {
			fontFamily: "Arial",
			fontSize: 28,
			strokeThickness: 0,
			fill: "white"
		});

		this.m_sidePanel = this.addGameObjectAsChild (SidePanel, this.getLayer (), this.getDepth () + 1000.0, true) as SidePanel;
		this.m_sidePanel.afterSetup ([this.m_worldName]);

		this.m_sidePanel.x = 0;
		this.m_sidePanel.y = 0;
	}

//------------------------------------------------------------------------------------------
	public onMouseDown (e:PIXI.InteractionEvent) {
		var __interactionData:PIXI.InteractionData = e.data;

		this.m_forceVector = this.m_terrainContainer.addGameObjectAsChild (ForceVector, 0, 0.0, true) as ForceVector;
		this.m_forceVector.afterSetup ([this.m_terrainContainer]);

		this.m_forceVector.x = __interactionData.getLocalPosition (this.m_XApp.getStage ()).x;
		this.m_forceVector.y = __interactionData.getLocalPosition (this.m_XApp.getStage ()).y;

		this.m_forceVector.addFiredListener ((__dx:number, __dy:number) => {
			console.log (": fired: ", __dx, __dy);

			this.m_golfBall.shootBall (__dx, __dy);
		});
	}

//------------------------------------------------------------------------------------------
	public createTerrainContainer ():TerrainContainer {
		this.m_terrainContainer = this.addGameObjectAsChild (TerrainContainer, 0, 500.0) as TerrainContainer;
		this.m_terrainContainer.afterSetup ();
		this.m_terrainContainer.x = 0;
		this.m_terrainContainer.y = 0;

		return this.m_terrainContainer;
	}

    //------------------------------------------------------------------------------------------
    public loadLevel (__path:string):void {
        this.loader = new PIXI.Loader ();

        this.m_loadComplete = false;

		console.log (": loadLevel: begin: ");

        this.loader.add(__path).load ((loader, resources) => {
            this.m_loadComplete = true;

            var __response:string = resources[__path].xhr.response;

			var __levelXMLString = __response;

			this.m_levelXML = new XSimpleXMLNode ();
			this.m_levelXML.setupWithXMLString (__levelXMLString);

			console.log (": loadLevel: ", __response);
        });
	}
	
//------------------------------------------------------------------------------------------
}