//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014-2021 Jimmy Huey (wuey99@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// <$end$/>
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { Assets, LoaderParser } from 'pixi.js';
import { XApp } from "../app/XApp";
import { XType } from '../type/XType';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XResourceManager } from './XResourceManager';
import { Resource } from './Resource';
import { ResourceSpec } from './XResourceManager';
export * from './XMapResourceX';

//------------------------------------------------------------------------------------------
const loadXML = {
    extension: {
        type: PIXI.ExtensionType.LoadParser,
        priority: 0
    },

    test (url: string):boolean {
        return (PIXI.utils.path.extname(url).toLowerCase() === '.xml');
    },

    async load<T> (url: string):Promise<T> {
        const response = await PIXI.settings.ADAPTER.fetch(url);
  
        const data = await response.text();
  
        return data as T;
    },
} as LoaderParser;

//------------------------------------------------------------------------------------------
PIXI.extensions.add (loadXML);

//------------------------------------------------------------------------------------------
export class XProjectManager {
    public m_XApp:XApp;
    public m_resourceManagers:Map<string, XResourceManager>;
    public m_manifest:XSimpleXMLNode;
    public m_loadComplete:boolean;
    public m_aliases:any;
    public m_typeMap:Map<string, any>;
    public m_cowResourceList:Array<ResourceSpec>;

    //------------------------------------------------------------------------------------------		
    constructor (__XApp:XApp) {
        this.m_XApp = __XApp;

        this.m_loadComplete = false;

        this.m_typeMap = new Map<string, any> ();

        this.m_resourceManagers = new Map<string, XResourceManager> ();
    }

    //------------------------------------------------------------------------------------------
    public setup (__manifestPath:string, __aliases:any, __callback:any):void {
        this.m_aliases = __aliases;

        this.m_loadComplete = false;

        __manifestPath = this.translateAlias (__manifestPath);

        Assets.load (__manifestPath).then ((__response:string) => {
            this.m_loadComplete = true;

            console.log (": XProjectManager: ", __response);

            this.m_manifest = new XSimpleXMLNode ();
            this.m_manifest.setupWithXMLString (__response);

            this.m_cowResourceList = new Array<ResourceSpec> ();

            this.parseCowResources (0, this.m_manifest, this.m_cowResourceList);  

            __callback ();
        });
    }
    
    //------------------------------------------------------------------------------------------
    public extractAssetsFromCow (__patterns:Array<string>):Array<ResourceSpec> {
        var __resourceList:Array<ResourceSpec> = new Array<ResourceSpec> ();

        var i:number = 0;

        while (i < this.m_cowResourceList.length) {
            var __resourceSpec:ResourceSpec = this.m_cowResourceList[i];

            var j:number = 0;

            var __matched:boolean = false;

            for (j = 0; j < __patterns.length; j++) {
                if (__resourceSpec.path.includes (__patterns[j])) {
                    __resourceList.push (__resourceSpec);

                    this.m_cowResourceList.splice (i, 1);

                    __matched = true;

                    break;
                }
            }

            if (!__matched) {
                i++;
            }
        }

        return __resourceList;
    }

    //------------------------------------------------------------------------------------------
    public setup0 (__manifestPath:string, __aliases:any):void {
        this.m_aliases = __aliases;
        
        this.m_loadComplete = false;
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        XType.forEach (this.m_resourceManagers,
            (__groupName:string) => {
                var __resourceManager:XResourceManager = this.m_resourceManagers.get (__groupName);
                __resourceManager.cleanup ();
            }
        );
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
    public parseCowResources (__depth:number, __xml:XSimpleXMLNode, __resources:Array<ResourceSpec>):void {
        var __tabs:Array<String> = ["", "...", "......", ".........", "............", "...............", "...................."];

        var __children:Array<XSimpleXMLNode> = __xml.child ("*");

        var i:number;

        for (i = 0; i < __children.length; i++) {
            var __xml:XSimpleXMLNode = __children[i];

            console.log (": ", __tabs[__depth], __xml.localName (), __xml.attribute ("name"));

            if (__xml.localName () == "folder") {
                this.parseCowResources (__depth + 1, __xml, __resources);
            }

            if (__xml.localName () == "resource") {
                console.log (": ", __tabs[__depth + 1], __xml.attribute ("path") + "/" + __xml.attribute ("dst"));

                console.log (": ", __xml.attribute ("name").startsWith ("$"));

                // determine if it's an .xmap ().zlib) by checking attribute "type" == ".as" and attribute "embed"
                // works for now, but we will eventually need a .zlib and .xmap type for level resources

                console.log (": ->: ", __xml.attribute ("name"), __xml.attribute ("type"), __xml.hasAttribute ("embed"));

                if (__xml.attribute ("type") == ".as" && __xml.hasAttribute ("embed")) {   
                    __resources.push ({
                        name: __xml.attribute ("name"),
                        type: "XMapResource",
                        path: "assets/" + __xml.attribute ("path") + "/" + __xml.attribute ("dst").replace (".swf", ".zlib")
                    });
                }

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
    public loadCowResources ():void {
        this.loadResources (this.m_cowResourceList, "Common");
    }

    //------------------------------------------------------------------------------------------
    public getLoadComplete ():boolean {
        var __allResourcesLoadComplete:boolean = true;

        XType.forEach (this.m_resourceManagers,
            (__groupName:string) => {
                var __resourceManager:XResourceManager = this.m_resourceManagers.get (__groupName);

                if (!__resourceManager.getLoadComplete ()) {
                    __allResourcesLoadComplete = false;
                }
            }
        );

        return this.m_loadComplete && __allResourcesLoadComplete;
    }

    //------------------------------------------------------------------------------------------
    public getLoadCompleteByGroups (__groupNames:Array<string>):boolean {
        var __allResourcesLoadComplete:boolean = true;

        XType.forEach (this.m_resourceManagers,
            (__groupName:string) => {
                if (__groupNames.indexOf (__groupName) >= 0) {
                    var __resourceManager:XResourceManager = this.m_resourceManagers.get (__groupName);

                    if (!__resourceManager.getLoadComplete ()) {
                        __allResourcesLoadComplete = false;
                    }
                }
            }
        );

        return this.m_loadComplete && __allResourcesLoadComplete;
    }

    //------------------------------------------------------------------------------------------
    public getResourceManagerByName (__groupName:string):XResourceManager {
        return this.m_resourceManagers.get (__groupName);
    }

    //------------------------------------------------------------------------------------------
    public getResourceHandleByName (__name:string):Resource {
        var __resource:Resource = null;

        XType.forEach (this.m_resourceManagers,
            (__groupName:string) => {
                var __resourceManager:XResourceManager = this.m_resourceManagers.get (__groupName);

                if (__resourceManager.getResourceHandleByName (__name) != null) {
                    __resource = __resourceManager.getResourceHandleByName (__name);
                }
            }
        );

        return __resource;
    }

    //------------------------------------------------------------------------------------------
    public getClass (__name:string):any {
        return this.getResourceByName (__name);
    }

    //------------------------------------------------------------------------------------------
    public getResourceByName (__name:string):any {
        var __resource:any = null;

        XType.forEach (this.m_resourceManagers,
            (__groupName:string) => {
                var __resourceManager:XResourceManager = this.m_resourceManagers.get (__groupName);

                if (__resourceManager.getResourceByName (__name) != null) {
                    __resource = __resourceManager.getResourceByName (__name);
                }
            }
        );

        return __resource;
    }

    //------------------------------------------------------------------------------------------
    public unloadClass (__name:string):void {
        this.unload (__name);
    }

    //------------------------------------------------------------------------------------------
    public unload (__name:string):void {
        this.getResourceHandleByName (__name).unload ();
    }
    
    //------------------------------------------------------------------------------------------
    public registerType (__type:string, __class:any):void {
        this.m_typeMap.set (__type, __class);
    }

    //------------------------------------------------------------------------------------------
    public getTypeMap ():Map<string, any> {
        return this.m_typeMap;
    }

    //------------------------------------------------------------------------------------------
    public getResourceManager (__groupName:string):XResourceManager {
        if (this.m_resourceManagers.has (__groupName)) {
            return this.m_resourceManagers.get (__groupName);
        } else {
            var __resourceManager:XResourceManager = new XResourceManager (this.m_XApp, this, __groupName);
            this.m_resourceManagers.set (__groupName, __resourceManager);
            return __resourceManager;
        }
    }

    //------------------------------------------------------------------------------------------
    public pauseAllResourceManagers ():void {
        XType.forEach (this.m_resourceManagers,
            (__groupName:string) => {
                var __resourceManager:XResourceManager = this.m_resourceManagers.get (__groupName);
                __resourceManager.pause ();
            }
        );
    }

    //------------------------------------------------------------------------------------------
    public startAllResourceManagers ():void {
        XType.forEach (this.m_resourceManagers,
            (__groupName:string) => {
                var __resourceManager:XResourceManager = this.m_resourceManagers.get (__groupName);
                __resourceManager.start ();
            }
        );
    }

    //------------------------------------------------------------------------------------------
    public startResourceManagersByName (__groupNames:Array<string>):void {
        XType.forEach (this.m_resourceManagers,
            (__groupName:string) => {
                if (__groupNames.indexOf (__groupName) >= 0) {
                    var __resourceManager:XResourceManager = this.m_resourceManagers.get (__groupName);
                    __resourceManager.start ();
                }
            }
        );
    }

    //------------------------------------------------------------------------------------------
    public queueResources (__resourceList:Array<ResourceSpec>, __groupName:string = "default"):void {   
        this.getResourceManager (__groupName).queueResources (__resourceList);
    }

    //------------------------------------------------------------------------------------------
    public loadResources (__resourceList:Array<ResourceSpec>, __groupName:string = "default"):void {   
        this.getResourceManager (__groupName).loadResources (__resourceList);
    }

//------------------------------------------------------------------------------------------
}