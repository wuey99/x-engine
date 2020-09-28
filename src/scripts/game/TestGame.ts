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
export class TestGame extends XState {
	
	public m_xml:any = {
		"any_name": {
			"person": [
				{
					"phone": [
						122233344550,
						122233344551
					],
					"name": "Jack",
					"age": 33,
					"married": {
						"#text": "Yes",
						"@": {
							"@_firstTime": "No"
						}
					},
					"birthday": "Wed, 28 Mar 1979 12:13:14 +0300",
					"address": [
						{
							"city": "New York",
							"street": "Park Ave",
							"buildingNo": 1,
							"flatNo": 1
						},
						{
							"city": "Boston",
							"street": "Centre St",
							"buildingNo": 33,
							"flatNo": 24
						}
					]
				},
				{
					"phone": [
						122233344553,
						122233344554
					],
					"name": "Boris",
					"age": 34,
					"married": {
						"#text": "Yes",
						"@": {
							"@_firstTime": "Yes"
						}
					},
					"birthday": "Mon, 31 Aug 1970 02:03:04 +0300",
					"address": [
						{
							"city": "Moscow",
							"street": "Kahovka",
							"buildingNo": 1,
							"flatNo": 2
						},
						{
							"city": "Tula",
							"street": "Lenina",
							"buildingNo": 3,
							"flatNo": 78
						}
					]
				}
			],
			"single": "yeah",
			"bleah": {
				"@": {
					"@_id": "01"
				},
				"grandpoobah": "",
				"pooblah": [
					{
						"@": {
							"@_id": "02"
						},
						"fuck": "yeah"
					},
					{
						"fuck": "yeah"
					}
				]
			}
		}
	};
	
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

		var __leader:FlockLeader = world.addGameObject (FlockLeader, 0, 0.0, false) as FlockLeader;
		__leader.afterSetup ();

		var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
		var __elementName: string;
		for (__elementName in this.m_xml) {
			__xml.setupWithJSON(__elementName, this.m_xml[__elementName]);
		}
		console.log (": xml: ", __xml);

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}