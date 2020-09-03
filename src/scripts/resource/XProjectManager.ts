//------------------------------------------------------------------------------------------
import { XApp } from "../app/XApp";
import { XResourceManager } from './XResourceManager';
import { ResourceSpec } from './XResourceManager';

//------------------------------------------------------------------------------------------
export class XProjectManager {
    public m_XApp:XApp;
    public m_resourceManager:XResourceManager;

    //------------------------------------------------------------------------------------------		
    constructor (__XApp:XApp) {
        this.m_XApp = __XApp;

        this.m_resourceManager = new XResourceManager (__XApp);
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
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