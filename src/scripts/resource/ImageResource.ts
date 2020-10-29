//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { XApp } from "../app/XApp";
import { Resource } from './Resource';

//------------------------------------------------------------------------------------------
export class ImageResource extends Resource {

    //------------------------------------------------------------------------------------------		
    constructor () {
        super ();
    }

    //------------------------------------------------------------------------------------------
    public setup (__path:string):void {
        super.setup (__path);
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
		PIXI.Loader.shared.add (this.m_path).load (() => {
            console.log (": ImageResource: loadComplete: ", this);

            this.m_loadComplete = true;
        });
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        if (this.getLoadComplete ()) {
            return PIXI.Loader.shared.resources[this.m_path].texture;
        } else {
            return null;
        }
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
    }

//------------------------------------------------------------------------------------------
}