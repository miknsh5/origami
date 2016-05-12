import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { CanActivate, Router } from '@angular/router-deprecated';
import { tokenNotExpired } from 'angular2-jwt';

import { OrgNodeDetailComponent } from './org-node-detail/index';
import { OrgChartModel, OrgNodeModel, OrgService } from './shared/index';

@Component({
    selector: 'origami-org',
    directives: [OrgNodeDetailComponent],
    templateUrl: 'app/org/org.component.html',
    styleUrls: ['app/org/org.component.css'],
    providers: [OrgService, HTTP_PROVIDERS] 
})

export class OrgComponent implements OnInit {
    orgChart: OrgChartModel;
    orgNodes: OrgNodeModel[];
    @Output() selectedNode = new EventEmitter<OrgNodeModel>();
    
    constructor(private orgService: OrgService, private router: Router) {     
        this.getAllNodes(); 
    }   
    
    ngOnInit() {
       alert();
    }
    
    getAllNodes(){
        this.orgService.getNodes()
            .subscribe(data => this.setOrgChartData(data),
            err => this.orgService.logError(err),
            () => console.log('Random Quote Complete'));
    }
    
    onNodeSelected(node) {
        this.selectedNode = node;
    } 
    
    onNodeDelete(deletedNode) {
        let index =this.orgNodes.indexOf(deletedNode, 0);
        if (index > -1) {
         this.orgNodes.splice(index, 1);
         this.selectedNode=null;
        }
        else{
            this.orgNodes.forEach(element => {
                let index= element.children.indexOf(deletedNode, 0);
                if(index>-1)
                {
                    element.children.splice(index,1);
                    this.selectedNode= null;
                }
            });
        }
    }
    
    private setOrgChartData(data: any){
        this.orgChart = data;
        this.orgNodes = this.orgChart.OrgNodes;
        console.log(this.orgChart);
    }
    
    logout() {
        localStorage.removeItem('profile');
        localStorage.removeItem('id_token');
        this.router.navigate(['/Login']);
    }

}   