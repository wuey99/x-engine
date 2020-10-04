//------------------------------------------------------------------------------------------
import { XApp } from "../app/XApp";
import { Resource} from './Resource';
import { SpriteSheetResource } from './SpriteSheetResource';
import { XTask } from '../task/XTask';
import { XType } from '../type/XType';

//------------------------------------------------------------------------------------------
export interface ResourceSpec {
    name:string;
    type:string;
    path:string;
}

//------------------------------------------------------------------------------------------
export class XResourceManager {
    public m_XApp:XApp;
    public m_resourceMap:Map<string, Resource>;
    public m_queue:Array<Resource>;
    public m_typeMap:Map<string, any>;

    //------------------------------------------------------------------------------------------		
    constructor (__XApp:XApp) {
        this.m_XApp = __XApp;

        this.m_resourceMap = new Map<string, Resource> ();
        this.m_queue = new Array<Resource> ();
        this.m_typeMap = new Map<string, any> ();

        this.checkQueueTask ();
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
    }

    //------------------------------------------------------------------------------------------
    public checkQueueTask ():void {
        var __currentResource:Resource = null;

        this.m_XApp.getXTaskManager ().addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
                    XTask.FLAGS, (__task:XTask) => {
                        if (__currentResource == null && this.m_queue.length > 0) {
                            __currentResource = this.m_queue.pop ();

                            __currentResource.load ();

                            __task.ifTrue (true);
                        } else {
                            __task.ifTrue (false);
                        }
                    }, XTask.BNE, "loop",

            XTask.LABEL, "wait",
                XTask.WAIT, 0x0100,

                XTask.FLAGS, (__task:XTask) => {
                    __task.ifTrue (__currentResource.getLoadComplete ());
                }, XTask.BNE, "wait",

            XTask.GOTO, "loop",

            XTask.RETN,
        ]);
    }

    //------------------------------------------------------------------------------------------
    public registerType (__type:string, __class:any):void {
        this.m_typeMap.set (__type, __class);
    }

    //------------------------------------------------------------------------------------------
    public loadResources (__resourceList:Array<ResourceSpec>):void {
        var __resourceSpec:ResourceSpec;

        for (__resourceSpec of __resourceList) {
            var __resource:Resource;

            __resource = XType.createInstance (this.m_typeMap.get (__resourceSpec.type));
            __resource.setup (__resourceSpec.path)

            this.m_queue.push (__resource);

            this.m_resourceMap.set (__resourceSpec.name, __resource);
        }
    }

    //------------------------------------------------------------------------------------------
    public getResourceByName (__name:string):any {
        var __resource:Resource = this.m_resourceMap.get (__name);

        return __resource.getResource ();
    }

    //------------------------------------------------------------------------------------------
    public getLoadComplete ():boolean {
        var __loadComplete:boolean = true;

        var __name:string;

        for (__name of this.m_resourceMap.keys ()) {
            var __resource:Resource = this.m_resourceMap.get (__name);

            __loadComplete = __resource.getLoadComplete ();
        }

        return __loadComplete;
    }

//------------------------------------------------------------------------------------------
}