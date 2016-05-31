import { Component, EventEmitter, Output, Input } from "@angular/core";
import { OrgNodeModel, OrgService } from "../shared/index";

@Component({
    selector: "sg-origami-add-node",
    templateUrl: "app/org/add-node/add-node.component.html",
    styleUrls: ["app/org/add-node/add-node.component.css"]
})

export class AddNodeComponent {
    @Input() selectedNode: OrgNodeModel;
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    node: OrgNodeModel = new OrgNodeModel();

    constructor(private orgService: OrgService) {
    }

    addChildNode(data: string) {
        let dataParts: string[] = data.split(",");

        this.node.children = null;
        this.node.NodeFirstName = dataParts[0];
        this.node.NodeLastName = dataParts[1];
        this.node.Description = dataParts[2];
        // this.node.NodeID=Number.parseInt(dataParts[3]);
        this.node.ParentNodeID = this.selectedNode.NodeID;
        this.node.OrgID = 1;

        console.log(this.node);
        this.addNewNode(this.node);

    }

    private addNewNode(node) {
        if (!node) { return; }
        this.orgService.addNode(node)
            .subscribe(data => this.emitaddNodeNotification(data),
            error => this.handleError(error),
            () => console.log("Node Added Complete"));
    }

    emitaddNodeNotification(data: OrgNodeModel) {
        if (data) {
            console.log(data);
            this.addNode.emit(data);
        }

    }

    private handleError(err) {
        alert("OOPs..!!Could not add..!! ");
        console.log(err);
    }

}

