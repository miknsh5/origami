import * as angular from '@angular/core';
import {Component, Input,Output, Directive,EventEmitter, Attribute, OnChanges, DoCheck, ElementRef, OnInit, SimpleChange} from '@angular/core';
import {Inject} from '@angular/core';

import * as d3 from 'd3';
import { OrgNodeModel } from '../shared/index';

@Directive({
    selector: 'tree-graph',
    inputs: ['treeData'],
    

})

export class OrgTree implements OnInit {
    tree: any;
    diagonal: any;
    svg: any;
    graph: any;
    root:any;
    duration:number=1555;
    nodes:any;
    links:any;
    nodeID:number=300;
    
   @Output() selectNode = new EventEmitter<OrgNodeModel>();
   selectedNode:any;
    treeData: any;
    constructor(
        @Inject(ElementRef) elementRef: ElementRef,
        @Attribute('width') width: number,
        @Attribute('height') height: number) {

        var el: any = elementRef.nativeElement;
        this.graph = d3.select(el);        
    }

    ngOnInit() {
        alert("init called" + this.treeData);
        var margin = { top: 20, right: 120, bottom: 20, left: 120 },
            width = 960 - margin.right - margin.left,
            height = 500 - margin.top - margin.bottom;
        this.tree = d3.layout.tree().size([height, width]);
        this.diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        this.svg = this.graph.append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
            
         this.root = this.treeData[0];
        this.render(this.root);
         this.centerNode(this.root);
    }
    
      centerNode(source) {
   
     let x = -source.y0;
        let y = -source.x0;
          x = x * 1 + 720 / 2;
        y = y * 1 + 460 / 2;
        d3.select('g').transition()
            .duration(this.duration)
            .attr("transform", "translate(" + x + "," + y + ")");
       
    }


    render(source) {
       
        let i: number = 0;
           this.nodes = this.tree.nodes(this.root).reverse(),
      this.links = this.tree.links(this.nodes);
  source.x0=source.x;
  source.y0=source.y;
  // Normalize for fixed-depth.
  this.nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = this.svg.selectAll("g.node")
      .data(this.nodes, function(d) { return d.NodeID || ( ++i); });


// Enter any new nodes at the parent's previous position.
 var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", (ev)=>this.click(ev));

    nodeEnter.append("circle")
    
        .attr("r", 1e-6)
      

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
     
      .style("fill-opacity", 1e-6);

node.select("text").text(function(d){return d.NodeFirstName;})
node.select("circle").style("fill", function(d) { console.log(d.IsSelected);return d.IsSelected ? "green" : "#fff"; });
  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(this.duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { console.log(d.NodeFirstName+ d.IsSelected);return d.IsSelected ? "green" : "#fff"; });;

  nodeUpdate.select("text")
      .style("fill-opacity", 1);


 
    
  
  // Transition exiting nodes to the parent's new position.
 /* var nodeExit = node.exit().transition().
      duration(this.duration)
      
      .remove();

  nodeExit.select("circle").transition()
      .duration(this.duration)
      .remove();

  nodeExit.select("text").transition()
      .duration(this.duration)
      .remove(); */
      
        var nodeExit = node.exit().transition().delay(100).
      duration(this.duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);
      

 var sourceCoords = {x: source.x0, y: source.y0};
        var diagCoords= this.diagonal({source: sourceCoords, target: sourceCoords});
        
         var sourceCoords2 = {x: source.x, y: source.y};
        var diagCoords2= this.diagonal({source: sourceCoords2, target: sourceCoords2});
        
  // Update the links…
  var link = this.svg.selectAll("path.link")
      .data(this.links, function(d) { return d.target.NodeID; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
     
      .attr("d", function(d) {
       
       return diagCoords2;
      });

  // Transition links to their new position.
  link.transition()
      .duration(this.duration)
      .attr("d", this.diagonal)
     ;

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(this.duration)
      .attr("d", function(d) {
       
        return diagCoords2;
      })
      .remove();

  // Stash the old positions for transition.
  this.nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
  d3.select('body').on('keydown',(ev)=>this.keyDown(ev))
    }
    
keyDown(d)
{
    if((event as KeyboardEvent).keyCode==13)
    {
        let parentID= this.selectedOrgNode.ParentNodeID;
        this.addEmptyChildToSelectedOrgNode(parentID, this.root)
        this.render(this.root);
    }
 else if((event as KeyboardEvent).keyCode==37)
 {
     
      let node = this.selectedOrgNode as d3.layout.tree.Node
      
      if(node.parent!=null )
      {
      let parentNode= node.parent;
      this.highlightSelectedNode(parentNode);
      this.render(parentNode);
      }
 }
 else if((event as KeyboardEvent).keyCode==39)
 {
     if(this.selectedOrgNode.children)
     {
         let node= this.selectedOrgNode.children[0];
         this.highlightSelectedNode(node);
         this.render(node);
     }
 }
 else if((event as KeyboardEvent).keyCode==38)
 {
     let node = this.selectedOrgNode as d3.layout.tree.Node;
     if(node.parent!=null)
     {
     let siblings= node.parent.children;
     let index= siblings.indexOf(node);
     if(index>0)
     {
         let elderSibling= siblings[index-1];
         this.highlightSelectedNode(elderSibling);
         this.render(elderSibling);
     }
     }
 }
 else if((event as KeyboardEvent).keyCode==40)
 {
     let node = this.selectedOrgNode as d3.layout.tree.Node;
     if(node.parent!=null)
     {
     let siblings= node.parent.children;
     let index= siblings.indexOf(node);
     if(index<siblings.length-1)
     {
         let youngerSibling= siblings[index+1];
         this.highlightSelectedNode(youngerSibling);
         this.render(youngerSibling);
     }
     }
 }
}

getNode(nodeID:number, node:OrgNodeModel)
{
   if(node.NodeID==nodeID)
        {
           
           return node;
            
           
        }else{
           
            if(node.children)
            {
            node.children.forEach(element=>this.getNode(nodeID,element));
            }
        }  
}
   addEmptyChildToSelectedOrgNode(parentID:number,node:OrgNodeModel)
    {
        if(this.selectedOrgNode==null)
        {
            return;
        }
        if(node.NodeID==parentID)
        {
           
            if(!node.children)
            {
                node.children= new Array<OrgNodeModel>();
                
            }
            let newNode= new OrgNodeModel();
            newNode.ParentNodeID= parentID;
            newNode.NodeID=this.nodeID;
            this.nodeID++;
          
            node.children.push(newNode);
            
            return;
        }else{
           
            if(node.children)
            {
            node.children.forEach(element=>this.addEmptyChildToSelectedOrgNode(parentID,element));
            }
        }
    }
   selectedOrgNode: OrgNodeModel ;
    click(d)
    {
    this.highlightSelectedNode(d);
     this.expandCollapse(d);
  this.render(d);

   this.centerNode(d);
    }
    
    expandCollapse(d)
    {
        
      if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
   
    }
    highlightSelectedNode(d)
    {
        
      if(this.selectedOrgNode)
      {
      this.selectedOrgNode.IsSelected= false;
      }
        d.IsSelected=true;
      this.selectedOrgNode= d;
      this.selectNode.emit(d);
    }
    ngOnChanges(changes: {[propertyName: string]: SimpleChange})
    {
        if(this.tree!=null)
        {
    
        
      this.root =this.treeData[0];//JSON.parse(JSON.stringify(this.treeData[0]));
      this.updateSelectedOrgNode(this.root);
        this.render(this.treeData[0]);
        
    }
}
 updateSelectedOrgNode(node:OrgNodeModel)
    {
        if(this.compareNodeID(node,this.selectedOrgNode))
        {
           this.selectedOrgNode=node;
            return;
        }else{
          
            if(node.children)
            {
            node.children.forEach(element=>this.updateSelectedOrgNode(element));
            }
        }
    }
    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        return updatedNode.NodeID === currentNode.NodeID;
    }

}