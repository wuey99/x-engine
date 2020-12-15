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
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XGameController } from '../../engine/state/XGameController';
import { TestGame } from './TestGame';
import { TestMatter } from './TestMatter';
import { TestRenderTexture } from '../test/TestRenderTexture';
import { TestSVG } from './TestSVG';
import { TerrainEditor } from '../editor/TerrainEditor';
import { GolfGame } from '../game/GolfGame';
import { EarthLevel } from '../worlds/EarthLevel';
import { MoonLevel } from '../worlds/MoonLevel';
import { MarsLevel } from '../worlds/MarsLevel';
import { IceLevel } from '../worlds/IceLevel';
import { SquidLevel } from '../worlds/SquidLevel';
import { GolfGameInstance } from '../game/GolfGameInstance';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';

//------------------------------------------------------------------------------------------
export class TestGameController extends XGameController {
	public m_loadTerrainComplete:boolean;
	public m_loadLayersComplete:boolean;
	public loader:PIXI.Loader;
	public m_terrainXML:XSimpleXMLNode;
	public m_layersXML:XSimpleXMLNode;
	public m_worldGravity:number;
	public m_worldMass:number;
	public m_score:number;

	public m_worldName:string;
	public m_terrainNum:string;
	public m_layersXMLString:string;
	public m_terrainXMLString:string;
	public m_levelData:any;

	public m_onStateChange:any;

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
		
		this.m_onStateChange = __params[0];
		this.m_worldName = __params[1];
		this.m_terrainNum = __params[2];
		this.m_layersXMLString = __params[3];
		this.m_terrainXMLString = __params[4];
		this.m_levelData = __params[5];
		this.m_score = __params[6];

		(this.getGameInstance () as GolfGameInstance).setOnStateChange (this.m_onStateChange);

		this.getGameInstance ().registerState ("TestGame", TestGame);
		this.getGameInstance ().registerState ("TestMatter", TestMatter);
		this.getGameInstance ().registerState ("TestRenderTexture", TestRenderTexture);
		this.getGameInstance ().registerState ("TestSVG", TestSVG);
		this.getGameInstance ().registerState ("TerrainEditor", TerrainEditor);
		this.getGameInstance ().registerState ("GolfGame", GolfGame);
		this.getGameInstance ().registerState ("EarthLevel", EarthLevel);
		this.getGameInstance ().registerState ("MoonLevel", MoonLevel);
		this.getGameInstance ().registerState ("MarsLevel", MarsLevel);
		this.getGameInstance ().registerState ("IceLevel", IceLevel);
		this.getGameInstance ().registerState ("SquidLevel", SquidLevel);

		if (this.m_layersXMLString == null || this.m_terrainXMLString == null) {
			this.loadLayers ("levels/" + "Earth" + "_Layers.xml");
			this.loadTerrain ("levels/Terrain" + "01" + ".xml");
		} else {
			this.getLevelFromXMLString ();
		}

		this.m_XApp.getXProjectManager ().pauseAllResourceManagers ();

		this.addTask ([
			XTask.LABEL, "loopLevel",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (
						this.m_loadTerrainComplete &&
						this.m_loadLayersComplete
					);
				}, XTask.BNE, "loopLevel",

				() => {
					this.m_worldName = this.m_layersXML.getAttributeString ("world");

					console.log (": load complete: ", this.m_worldName);

					this.m_XApp.getXProjectManager ().startResourceManagersByName (["default", "Common", this.m_worldName]);
				},

				XTask.LABEL, "loopAssets",
					XTask.WAIT, 0x0100,

					XTask.FLAGS, (__task:XTask) => {
						__task.ifTrue (
							this.m_XApp.getXProjectManager ().getLoadCompleteByGroups (["Common", this.m_worldName])
						);
					}, XTask.BNE, "loopAssets",

				() => { 
					this.m_XApp.getXProjectManager ().startAllResourceManagers ();

					this.getGameInstance ().gotoState ("TestGame");
				},

			XTask.RETN,
		]);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------
	public getGameInstanceClass ():any {
		return GolfGameInstance;
	}

	//-----------------------------------------------------------------------------------------
	public getLevelFromXMLString ():void {
		this.m_terrainXML = new XSimpleXMLNode ();
		this.m_terrainXML.setupWithXMLString (this.m_terrainXMLString);
		this.m_loadTerrainComplete = true;
		
		this.m_layersXML = new XSimpleXMLNode ();
		this.m_layersXML.setupWithXMLString (this.m_layersXMLString);
        this.m_loadLayersComplete = true;
	}

    //------------------------------------------------------------------------------------------
    public loadTerrain (__path:string):void {
        this.loader = new PIXI.Loader ();

        this.m_loadTerrainComplete = false;

		console.log (": loadTerrain: begin: ");

		__path = this.translateAlias (__path);

		console.log (": terrainPath: ", __path);

        this.loader.add (__path).load ((loader, resources) => {
            this.m_loadTerrainComplete = true;

            var __response:string = resources[__path].xhr.response;

			var __terrainXMLString = __response;

			this.m_terrainXML = new XSimpleXMLNode ();
			this.m_terrainXML.setupWithXMLString (__terrainXMLString);

			console.log (": loadTerrain: ", __response);
        });
	}
	
    //------------------------------------------------------------------------------------------
    public loadLayers (__path:string):void {
        this.loader = new PIXI.Loader ();

        this.m_loadLayersComplete = false;

		console.log (": loadLayers: begin: ");

		__path = this.translateAlias (__path);

		console.log (": layersPath: ", __path);

        this.loader.add (__path).load ((loader, resources) => {
            this.m_loadLayersComplete = true;

            var __response:string = resources[__path].xhr.response;

			var __layersXML = __response;

			this.m_layersXML = new XSimpleXMLNode ();
			this.m_layersXML.setupWithXMLString (__layersXML);

			console.log (": loadLayers: ", __response);
        });
	}

//------------------------------------------------------------------------------------------
}