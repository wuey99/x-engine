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
import { Box } from './Box';
import { XJustify } from './XJustify';
import { XHorzAlign } from './XHorzAlign';
import { XVertAlign } from './XVertAlign';

//------------------------------------------------------------------------------------------
export class XGridRow extends Box {
    public m_horzAlign:string;
    public m_vertAlign:string;
    public m_cellWidth:number;
    public m_cellHeight:number;

//------------------------------------------------------------------------------------------
    public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);	

        this.m_cellWidth = __params[this.m_paramIndex++];
        this.m_cellHeight = __params[this.m_paramIndex++];
        this.m_horzAlign = __params[this.m_paramIndex++];
        this.m_vertAlign = __params[this.m_paramIndex++];

        return this;
    }

//------------------------------------------------------------------------------------------
    public reorder ():void {
        super.reorder ();

        //------------------------------------------------------------------------------------------
        var __x:number = 0;
        
        var i:number;

        for (i = 0; i < this.m_items.length; i++) {
            switch (this.m_horzAlign) {
                case XHorzAlign.LEFT:
                    this.m_items[i].x = __x;
                    break;
                case XHorzAlign.CENTER:
                    this.m_items[i].x = __x + (this.m_cellWidth - this.m_items[i].width) / 2;
                    break;
                case XHorzAlign.RIGHT:
                    this.m_items[i].x = __x + this.m_cellWidth - this.m_items[i].width;
                    break;
            }

            switch (this.m_vertAlign) {
                case XVertAlign.TOP:
                    this.m_items[i].y = 0;
                    break;
                case XVertAlign.CENTER:
                    this.m_items[i].y = (this.m_cellHeight - this.m_items[i].height) / 2;
                    break;
                case XVertAlign.BOTTOM:
                    this.m_items[i].y = this.m_cellHeight - this.m_items[i].height;
                    break;
            }

            __x += this.m_cellWidth;
        }
    }

//------------------------------------------------------------------------------------------	
}
	
