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
	/*
	Implements different bin packer algorithms that use the MAXRECTS data structure.
	See http://clb.demon.fi/projects/even-more-rectangle-bin-packing
	
	Author: Jukka Jylänki
	- Original
	
	Author: Claus Wahlers
	- Ported to ActionScript3
	
	Author: Tony DiPerna
	- Ported to HaXe, optimized
	
	Author: Shawn Skinner (treefortress)
	- Ported back to AS3

    Author: Jimmy Huey
    - Ported back to HaXe

    Author: Jimmy Huey
    - Ported to Typescript / PixiJS
	*/
	//------------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------------
    import * as PIXI from 'pixi.js'
    import { XType } from '../type/XType';
	
    //------------------------------------------------------------------------------------------
	export class MaxRectPacker {
		public freeRectangles:Array<PIXI.Rectangle>;
		
		public binWidth:number;
	    public binHeight:number;
		
		public constructor (width:number, height:number) {
			this.init(width, height);
		}
		
		public init(width:number, height:number):void {
			this.binWidth = width;
			this.binHeight = height;
			this.freeRectangles = new Array<PIXI.Rectangle> ();
			this.freeRectangles.push(new PIXI.Rectangle(0, 0, width, height));
		}
		
		public copyFrom(fromFreeRectangles:Array<PIXI.Rectangle>):void {
			this.freeRectangles = new Array<PIXI.Rectangle> ();
			
			for (var i=0; i < fromFreeRectangles.length; i++) {
				this.freeRectangles.push(fromFreeRectangles[i]);
			}
		}
		
		public quickInsert(width:number, height:number):PIXI.Rectangle {
			var newNode:PIXI.Rectangle = this.quickFindPositionForNewNodeBestAreaFit(width, height);
			
			if (newNode.height == 0) {
				return null;
			}
			
			var numRectanglesToProcess:number = this.freeRectangles.length;
			var i:number = 0;
			while (i < numRectanglesToProcess) {
				if (this.splitFreeNode(this.freeRectangles[i], newNode)) {
					this.freeRectangles.splice(i, 1);
					--numRectanglesToProcess;
					--i;
				}
				i++;
			}
			
			this.pruneFreeList();
			return newNode;
		}
		
		// [Inline]
		private quickFindPositionForNewNodeBestAreaFit(width:number, height:number):PIXI.Rectangle {
			var score:number = XType.Number_MAX_VALUE ();
			var areaFit:number;
			var r:PIXI.Rectangle;
			var bestNode:PIXI.Rectangle = new PIXI.Rectangle();
			
			var l:number = this.freeRectangles.length;
				
			for (var i = 0; i < l; i++) {
				r = this.freeRectangles[i];
				// Try to place the rectangle in upright (non-flipped) orientation.
				if (r.width >= width && r.height >= height) {
					areaFit = r.width * r.height - width * height;
					if (areaFit < score) {
						bestNode.x = r.x;
						bestNode.y = r.y;
						bestNode.width = width;
						bestNode.height = height;
						score = areaFit;
					}
				}
			}
			
			return bestNode;
		}
		
		private splitFreeNode(freeNode:PIXI.Rectangle, usedNode:PIXI.Rectangle):boolean {
			var newNode:PIXI.Rectangle;
			// Test with SAT if the rectangles even intersect.
			if (usedNode.x >= freeNode.x + freeNode.width ||
				usedNode.x + usedNode.width <= freeNode.x ||
				usedNode.y >= freeNode.y + freeNode.height ||
				usedNode.y + usedNode.height <= freeNode.y) {
				return false;
			}
			if (usedNode.x < freeNode.x + freeNode.width && usedNode.x + usedNode.width > freeNode.x) {
				// New node at the top side of the used node.
				if (usedNode.y > freeNode.y && usedNode.y < freeNode.y + freeNode.height) {
					newNode = freeNode.clone();
					newNode.height = usedNode.y - newNode.y;
					this.freeRectangles.push(newNode);
				}
				// New node at the bottom side of the used node.
				if (usedNode.y + usedNode.height < freeNode.y + freeNode.height) {
					newNode = freeNode.clone();
					newNode.y = usedNode.y + usedNode.height;
					newNode.height = freeNode.y + freeNode.height - (usedNode.y + usedNode.height);
					this.freeRectangles.push(newNode);
				}
			}
			if (usedNode.y < freeNode.y + freeNode.height && usedNode.y + usedNode.height > freeNode.y) {
				// New node at the left side of the used node.
				if (usedNode.x > freeNode.x && usedNode.x < freeNode.x + freeNode.width) {
					newNode = freeNode.clone();
					newNode.width = usedNode.x - newNode.x;
					this.freeRectangles.push(newNode);
				}
				// New node at the right side of the used node.
				if (usedNode.x + usedNode.width < freeNode.x + freeNode.width) {
					newNode = freeNode.clone();
					newNode.x = usedNode.x + usedNode.width;
					newNode.width = freeNode.x + freeNode.width - (usedNode.x + usedNode.width);
					this.freeRectangles.push(newNode);
				}
			}
			return true;
		}
		
		private pruneFreeList():void  {
			// Go through each pair and remove any rectangle that is redundant.
			var i:number = 0;
			var j:number = 0;
			var len:number = this.freeRectangles.length;
			var tmpRect:PIXI.Rectangle;
			var tmpRect2:PIXI.Rectangle;
			while (i < len) {
				j = i + 1;
				tmpRect = this.freeRectangles[i];
				while (j < len) {
					tmpRect2 = this.freeRectangles[j];
					if (this.isContainedIn(tmpRect,tmpRect2)) {
						this.freeRectangles.splice(i, 1);
						--i;
						--len;
						break; /* loop */
					}
					if (this.isContainedIn(tmpRect2,tmpRect)) {
						this.freeRectangles.splice(j, 1);
						--len;
						--j;
					}
					j++;
				}
				i++;
			}
		}
		
		// [Inline]
		private isContainedIn(a:PIXI.Rectangle, b:PIXI.Rectangle):boolean {
			return a.x >= b.x && a.y >= b.y	&& a.x + a.width <= b.x + b.width && a.y + a.height <= b.y + b.height;
		}
	}
// }