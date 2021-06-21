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
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
import { TextInput } from 'pixi-textinput-v5';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';

//------------------------------------------------------------------------------------------
export class Box extends XGameObject {
    public m_width:number;
    public m_height:number;
    public m_justify:string;
    public m_fillColor:number;
    public m_spacing:number;
    public m_padding:number;
    public m_topPadding:number;
    public m_bottomPadding:number;
    public m_leftPadding:number;
    public m_rightPadding:number;
    public m_items:Array<PIXI.Sprite | TextInput>;
    public m_ids:Map<string, PIXI.Sprite | TextInput>;
    public m_groups:Map<string, Map<PIXI.Sprite | TextInput, number>>;
    public m_fill:PIXI.Graphics;

//------------------------------------------------------------------------------------------
	public constructor () {
		super ();
	}

//------------------------------------------------------------------------------------------
    public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

        this.m_items = new Array<PIXI.Sprite | TextInput> ();
        this.m_ids = new Map<string, PIXI.Sprite | TextInput> ();
        this.m_groups = new Map<string, Map<PIXI.Sprite | TextInput, number>> ();
        
        return this;
    }

//------------------------------------------------------------------------------------------
    public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);	

        this.m_width = __params[this.m_paramIndex++];
        this.m_height = __params[this.m_paramIndex++];
        this.m_justify = __params[this.m_paramIndex++];
        this.m_fillColor = __params[this.m_paramIndex++];

        this.m_spacing = 0;
        this.m_padding = 0;
        this.m_leftPadding = 0;
        this.m_rightPadding = 0;
        this.m_topPadding = 0;
        this.m_bottomPadding = 0;

        this.createFill ();

        return this;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public get width ():number {
        return this.m_width;
    }

//------------------------------------------------------------------------------------------
    public get height ():number {
        return this.m_height;
    }

//------------------------------------------------------------------------------------------
    public set spacing (__value:number) {
        this.m_spacing = __value;
    }
    
//------------------------------------------------------------------------------------------
    public createFill ():void {
        if (this.m_fillColor != -1) {
            this.m_fill = new PIXI.Graphics ();

            this.m_fill.beginFill (this.m_fillColor);
            this.m_fill.drawRect (0, 0, this.m_width, this.m_height);
            this.m_fill.endFill ();

            this.addSortableChild (this.m_fill, this.getLayer (), this.getDepth () - 1, true);
        }
    }

//------------------------------------------------------------------------------------------
    public setFillColor (__color:number):void {
        this.m_fillColor = __color;

        if (this.m_fill == null) {
            this.createFill ()

            return;
        }

        this.m_fill.beginFill (this.m_fillColor);
        this.m_fill.drawRect (0, 0, this.m_width, this.m_height);
        this.m_fill.endFill ();
    }

//------------------------------------------------------------------------------------------
    public getItems ():Array<PIXI.Sprite | TextInput> {
        return this.m_items;
    }

//------------------------------------------------------------------------------------------
    public addItemToGroup (__item:PIXI.Sprite | TextInput, __groupName:string):void {
        if (__groupName != "") {
            var __group:Map<PIXI.Sprite | TextInput, number>;

            if (this.m_groups.has (__groupName)) {
                __group = this.m_groups.get (__groupName);
            } else {
                __group = new Map<PIXI.Sprite | TextInput, number> ();

                this.m_groups.set (__groupName, __group);
            }

            __group.set (__item, 0);
        }
    }

//------------------------------------------------------------------------------------------
    public getItemsFromGroup (__groupName:string):Map<PIXI.Sprite | TextInput, number> {
        if (__groupName != "") {
            if (this.m_groups.has (__groupName)) {
                return this.m_groups.get (__groupName);
            } 
        }

        return null
    }
    
//------------------------------------------------------------------------------------------
    public removeItemFromGroup (__item:PIXI.Sprite | TextInput, __groupName:string):void {
        if (__groupName != "") {
            var __group:Map<PIXI.Sprite | TextInput, number>;

            if (this.m_groups.has (__groupName)) {
                __group = this.m_groups.get (__groupName);

                __group.delete (__item);
            }
        }
    }

//------------------------------------------------------------------------------------------
    public addItem (__item:PIXI.Sprite | TextInput, __id:string = "", __groupName:string = ""):void {
        this.m_items.push (__item);

        this.m_ids.set (__id, __item);

        this.addItemToGroup (__item, __groupName);

        this.reorder ();
    }

    //------------------------------------------------------------------------------------------
    public getIndexByItem (__item:PIXI.Sprite | TextInput):number {
        var i:number;

        for (i = 0; i < this.m_items.length; i++) {
            if (__item == this.m_items[i]) {
                return i;
            }
        }

        return -1;
    }

//------------------------------------------------------------------------------------------
    public getItemById (__id:string = ""):PIXI.Sprite | TextInput {
        return this.m_ids.get (__id);
    }

//------------------------------------------------------------------------------------------
    public removeItem (__item:PIXI.Sprite | TextInput):void {
        var __index:number = this.m_items.indexOf (__item);

        if (__index >= 0) {
            if (this.m_childSprites.has (__item)) {
                this.removeChildSprite (__item);
            }

            if (this.m_childObjects.has (__item as XGameObject)) {
                this.removeChildObject (__item as XGameObject);
            }

            this.m_items.splice (__index, 1);

            XType.forEach (this.m_ids,
                (__id:string) => {
                    if (this.m_ids.get (__id) == __item) {
                        this.m_ids.delete (__id);
                    }
                }
            );
        }
    }

//------------------------------------------------------------------------------------------
    public removeAllItems ():void {
        var __itemsToDelete:Array<PIXI.Sprite | TextInput> = new Array<PIXI.Sprite | TextInput> ();

        var i:number;

        for (i = 0; i < this.m_items.length; i++) {
            __itemsToDelete.push (this.m_items[i]);
        }

        for (i = 0; i < __itemsToDelete.length; i++) {
           this.removeItem (__itemsToDelete[i]);
        }
    }

//------------------------------------------------------------------------------------------
    public reorder ():void {
    }

	//------------------------------------------------------------------------------------------
	public getBoxLayer (__xml:XSimpleXMLNode):number {
		var __layer:number;

		if (__xml.hasAttribute ("layer")) {
			__layer = __xml.getAttributeInt ("layer");
		} else {
			__layer = this.getLayer ();
		}

		return __layer;
	}

	//------------------------------------------------------------------------------------------
	public getBoxDepth (__xml:XSimpleXMLNode):number {
		var __depth:number;

		if (__xml.hasAttribute ("depth")) {
			__depth = __xml.getAttributeFloat ("depth");
		} else {
			__depth = this.getDepth ();
		}

		if (__xml.hasAttribute ("depth+")) {
			__depth += __xml.getAttributeFloat ("depth+");
		}

		return __depth;
    }
    
//------------------------------------------------------------------------------------------
    public getActualWidth ():number {
        return this.m_width - this.m_leftPadding - this.m_rightPadding;
    }

//------------------------------------------------------------------------------------------
    public getActualHeight ():number {
        return this.m_height - this.m_topPadding - this.m_bottomPadding;
    }

//------------------------------------------------------------------------------------------	
}
	
