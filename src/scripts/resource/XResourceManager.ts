import { XApp } from "../app/XApp";
import { Resource} from './Resource';
import { SpriteSheetResource } from './SpriteSheetResource';
import { XTask } from '../task/XTask';

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

    //------------------------------------------------------------------------------------------		
    constructor (__XApp:XApp) {
        this.m_XApp = __XApp;

        this.m_resourceMap = new Map<string, Resource> ();
        this.m_queue = Array<Resource> ();

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
    public loadResources (__resourceList:Array<ResourceSpec>):void {
        var __resourceSpec:ResourceSpec;

        for (__resourceSpec of __resourceList) {
            var __resource:Resource;

            if (__resourceSpec.type == "SpriteSheet") {
                __resource = new SpriteSheetResource ();
            }

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