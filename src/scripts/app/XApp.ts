//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'

//------------------------------------------------------------------------------------------
export interface XAppParams {
    containerId: string,
    canvasW: number,
    canvasH: number,
    fpsMax: number
}

//------------------------------------------------------------------------------------------
export class XApp {
  
    public container: HTMLElement;
    public loader: PIXI.Loader;
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public graphics: PIXI.Graphics;
    public fpsMax: number;

    //------------------------------------------------------------------------------------------
    constructor (params: XAppParams) {
        this.loader = PIXI.Loader.shared;
        this.renderer = PIXI.autoDetectRenderer ({
            width: params.canvasW,
            height: params.canvasH,
            antialias: true
        });
        this.stage = new PIXI.Container ();
        this.graphics = new PIXI.Graphics ();
        this.fpsMax = params.fpsMax;

        this.container = params.containerId ? document.getElementById(params.containerId) || document.body : document.body;
        this.container.appendChild(this.renderer.view)
    }

//------------------------------------------------------------------------------------------
}