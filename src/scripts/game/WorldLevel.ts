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
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { TerrainContainer } from '../terrain/TerrainContainer';
import { XState } from '../state/XState';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { ForceVector } from './ForceVector';
import { GolfBall } from './GolfBall';
import * as Matter from 'matter-js';
import {Howl, Howler} from 'howler';
import { SidePanel } from '../sidepanel/SidePanel';
import { GameLayersContainer } from '../terrain/GameLayersContainer';
import { GolfGame } from './GolfGame';

//------------------------------------------------------------------------------------------
export class WorldLevel extends GolfGame {

//------------------------------------------------------------------------------------------
    public loadLevel (__params:Array<any>):void {
		this.m_worldName = __params[0];
        this.m_terrain = __params[1];
        
        this.loadLayers ("levels/" + this.m_worldName + "_Layers.xml");
        this.loadTerrain ("levels/Terrain" + this.m_terrain + ".xml");
    }

//------------------------------------------------------------------------------------------
}