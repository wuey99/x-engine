//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { XApp } from "../app/XApp";
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XResourceManager } from './XResourceManager';
import { ResourceSpec } from './XResourceManager';

//------------------------------------------------------------------------------------------
export class XProjectManager {
    public m_XApp:XApp;
    public m_resourceManager:XResourceManager;
    public loader:PIXI.Loader;
    public m_manifest:XSimpleXMLNode;
    public m_loadComplete:boolean;

    //------------------------------------------------------------------------------------------		
    constructor (__XApp:XApp) {
        this.m_XApp = __XApp;

        this.m_loadComplete = false;

        this.m_resourceManager = new XResourceManager (__XApp);
    }

    //------------------------------------------------------------------------------------------
    public setup (__manifestPath:string):void {
        this.loader = new PIXI.Loader ();

        this.m_loadComplete = false;

        this.loader.add(__manifestPath).load ((loader, resources) => {
            this.m_loadComplete = true;

            var __response:string = resources[__manifestPath].xhr.response;

            console.log (": XProjectManager: ", __response);

            this.m_manifest = new XSimpleXMLNode ();
            this.m_manifest.setupWithXMLString (__response);

            this.parseResources (0, this.m_manifest);  
        });
    }
    
    //------------------------------------------------------------------------------------------
    public cleanup ():void {
    }

    //------------------------------------------------------------------------------------------
    public parseResources (__depth:number, __xml:XSimpleXMLNode):void {
        var __tabs:Array<String> = ["", "...", "......", ".........", "............", "...............", "...................."];

        var __children:Array<XSimpleXMLNode> = __xml.child ("*");

        var i:number;

        var __resources:Array<ResourceSpec> =  new Array<ResourceSpec> ();

        for (i = 0; i < __children.length; i++) {
            var __xml:XSimpleXMLNode = __children[i];

            console.log (": ", __tabs[__depth], __xml.localName (), __xml.attribute ("name"));

            if (__xml.localName () == "folder") {
                this.parseResources (__depth + 1, __xml);
            }

            if (__xml.localName () == "resource") {
                console.log (": ", __tabs[__depth + 1], __xml.attribute ("path") + "/" + __xml.attribute ("dst"));

                console.log (": ", __xml.attribute ("name").startsWith ("$"));

                if (__xml.attribute ("name").startsWith ("$")) {
                    __resources.push ({
                        name: __xml.attribute ("name").substr (1),
                        type: "SpriteSheet",
                        path: "assets/" + __xml.attribute ("path") + "/" + __xml.attribute ("dst")
                    });
                }
            }
        }

        this.loadResources (__resources);
    }

    //------------------------------------------------------------------------------------------
    public getLoadComplete ():boolean {
        return this.m_loadComplete && this.m_resourceManager.getLoadComplete ();
    }

    //------------------------------------------------------------------------------------------
    public getResourceManager ():XResourceManager {
        return this.m_resourceManager
    }

    //------------------------------------------------------------------------------------------
    public getResourceByName (__name:string):any {
        return this.m_resourceManager.getResourceByName (__name);
    }

    //------------------------------------------------------------------------------------------
    public registerType (__type:string, __class:any):void {
        this.m_resourceManager.registerType (__type, __class);
    }

    //------------------------------------------------------------------------------------------
    public loadResources (__resourceList:Array<ResourceSpec>):void {
        this.m_resourceManager.loadResources (__resourceList);
    }

//------------------------------------------------------------------------------------------
}