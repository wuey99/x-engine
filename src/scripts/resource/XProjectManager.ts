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
    public m_aliases:any;

    //------------------------------------------------------------------------------------------		
    constructor (__XApp:XApp) {
        this.m_XApp = __XApp;

        this.m_loadComplete = false;

        this.m_resourceManager = new XResourceManager (__XApp, this);
    }

    //------------------------------------------------------------------------------------------
    public setup (__manifestPath:string, __aliases:any):void {
        this.m_aliases = __aliases;

        this.loader = new PIXI.Loader ();

        this.m_loadComplete = false;

        __manifestPath = this.translateAlias (__manifestPath);

        this.loader.add(__manifestPath).load ((loader, resources) => {
            this.m_loadComplete = true;

            var __response:string = resources[__manifestPath].xhr.response;

            console.log (": XProjectManager: ", __response);

            this.m_manifest = new XSimpleXMLNode ();
            this.m_manifest.setupWithXMLString (__response);

            var __resources:Array<ResourceSpec> =  new Array<ResourceSpec> ();

            this.parseResources (0, this.m_manifest, __resources);  

            this.loadResources (__resources);
        });
    }
    
    //------------------------------------------------------------------------------------------
    public setup0 (__manifestPath:string, __aliases:any):void {
        this.m_aliases = __aliases;

        this.loader = new PIXI.Loader ();

        this.m_loadComplete = false;
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
    }

    //------------------------------------------------------------------------------------------
    public getAliases ():any {
        return this.m_aliases;
    }

    //------------------------------------------------------------------------------------------
    public translateAlias (__path:string):string {
        var __alias:string;
        var __aliases:any = this.getAliases ();

        for (__alias in __aliases) {
            if (__path.startsWith (__alias + "/")) {
                __path = __path.replace (__alias + "/", __aliases[__alias] + "/");

                return __path;
            }
        }

        return __path;
    }

    //------------------------------------------------------------------------------------------
    public parseResources (__depth:number, __xml:XSimpleXMLNode, __resources:Array<ResourceSpec>):void {
        var __tabs:Array<String> = ["", "...", "......", ".........", "............", "...............", "...................."];

        var __children:Array<XSimpleXMLNode> = __xml.child ("*");

        var i:number;

        for (i = 0; i < __children.length; i++) {
            var __xml:XSimpleXMLNode = __children[i];

            console.log (": ", __tabs[__depth], __xml.localName (), __xml.attribute ("name"));

            if (__xml.localName () == "folder") {
                this.parseResources (__depth + 1, __xml, __resources);
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