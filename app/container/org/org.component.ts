import { Component, Output, EventEmitter, OnDestroy, HostListener } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";

import {
    DraggedNode, OrgNodeModel, ChartMode, OrgCompanyModel,
    OrgGroupModel, OrgNodeStatus, OrgService, TutorialMode, TutorialNodeState
} from "../../shared/index";

const MIN_HEIGHT: number = 420;
const MIN_WIDTH: number = 640;
const WINDOW_MIN_WIDTH: number = 320;
const DEFAULT_OFFSET: number = 61;

declare var svgPanZoom: any;

@Component({
    selector: "pt-org",
    templateUrl: "app/container/org/org.component.html",
    styleUrls: ["app/container/org/org.component.css"]
})

export class OrgComponent implements OnDestroy {
    private orgNodes: OrgNodeModel[];
    private svgWidth: number;
    private svgHeight: number;
    private buildView: any;
    private reportView: any;
    private exploreView: any;
    private svgPan: any;
    private isSmartBarEnabled: boolean;
    private isEditModeEnable: boolean;
    orgGroup: OrgGroupModel;
    isTutorialModeEnabled: boolean;

    @Output() selectedOrgNode: OrgNodeModel;
    @Output() companyID: any;
    @Output() currentChartMode: ChartMode;
    @Output() treeJson: any;
    @Output() isAddOrEditMode: boolean;
    @Output() displayFirstNameLabel: boolean;
    @Output() displayLastNameLabel: boolean;
    @Output() displayDescriptionLabel: boolean;
    @Output() isOrgNodeEmpty: boolean;
    @Output() currentOrgNodeStatus: OrgNodeStatus;
    @Output() isMenuSettingsEnabled: boolean;
    @Output() searchedNode: OrgNodeModel;
    @Output() isNodeMoveEnabled: boolean;
    @Output() isFeedbackInEditMode: boolean;
    @Output() isHorizontalViewEnabled: boolean;
    @Output() horizontalSpaceForNode: number;
    @Output() verticalSpaceForNode: number;
    @Output() tutorialStatus: TutorialMode;
    @Output() orgCurrentState: TutorialNodeState;
    @Output() isDetailPanelClosed: boolean;

    constructor(private orgService: OrgService) {
        this.currentChartMode = ChartMode.build;
        this.enableLabels();
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
        this.currentOrgNodeStatus = OrgNodeStatus.None;
        this.isTutorialModeEnabled = this.isMenuSettingsEnabled = false;
        this.tutorialStatus = TutorialMode.Skiped;
        this.changedStateForTutorial(TutorialNodeState.None);
    }

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: any) {
        if ((event.metaKey || event.ctrlKey) && event.keyCode === "1".charCodeAt(0)) {
            event.preventDefault();
            this.changeViewModeNav(ChartMode.build);
        } else if ((event.metaKey || event.ctrlKey) && event.keyCode === "2".charCodeAt(0)) {
            event.preventDefault();
            this.changeViewModeNav(ChartMode.report);
        }
    }

    onResize(event) {
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
    }

    enableFirstNameLabel(data) {
        this.displayFirstNameLabel = data;
    }

    enableLastNameLabel(data) {
        this.displayLastNameLabel = data;
    }

    enableDescriptionLabel(data) {
        this.displayDescriptionLabel = data;
    }
    enableLabels() {
        this.displayFirstNameLabel = true;
        this.displayLastNameLabel = true;
        this.displayDescriptionLabel = true;
    }

    changeViewModeNav(viewMode) {
        if (!this.isAddOrEditMode && this.selectedOrgNode) {
            if (viewMode === ChartMode.build) {
                this.enableLabels();
                this.currentChartMode = ChartMode.build;
                this.enableViewModesNav(ChartMode.build);
                this.disablePan();
            } else {
                if (this.tutorialStatus === TutorialMode.Continued) {
                    if (viewMode === ChartMode.report) {
                        this.currentChartMode = ChartMode.report;
                    } else {
                        this.currentChartMode = ChartMode.explore;
                    }
                    this.enableViewModesNav(this.currentChartMode);
                    this.enableLabels();
                    this.enablePan();
                } else {
                    this.onTutorialModeChanged(TutorialMode.Interupted);
                }
            }
            if (this.isNodeMoveEnabled) {
                this.isNodeMoveEnabled = false;
            }
        } else {
            this.disablePan();
        }
    }

    onHorizontalViewChanged(value: boolean) {
        this.isHorizontalViewEnabled = value;
    }

    feedbackPanelInEditMode(value: boolean) {
        this.isFeedbackInEditMode = value;
    }

    onNodeMoveEnabledOrDisabled(value: boolean) {
        this.isNodeMoveEnabled = value;
    }

    smartBarEnabled(value: boolean) {
        this.isSmartBarEnabled = value;
        this.onAddOrEditModeValueSet(value);
    }

    isEditEnabled(value: boolean) {
        this.isEditModeEnable = value;
        this.onAddOrEditModeValueSet(value);
    }

    changedStateForTutorial(data: TutorialNodeState) {
        this.orgCurrentState = data;
    }

    onNodeSelected(node) {
        if (!this.isSmartBarEnabled || (!this.selectedOrgNode && node)) {
            let prevNode = this.selectedOrgNode ? this.selectedOrgNode : new OrgNodeModel();
            this.selectedOrgNode = node;
            if (this.selectedOrgNode) {
                if (node.NodeID === -1) {
                    this.isAddOrEditMode = true;
                } else if ((this.isAddOrEditMode || !this.isAddOrEditMode && prevNode && prevNode.IsNewRoot)
                    && prevNode && prevNode.NodeID !== node.NodeID) {
                    this.isAddOrEditMode = false;
                }
            }
            this.currentOrgNodeStatus = OrgNodeStatus.None;
        }
    }

    onNodeAdded(addedNode: OrgNodeModel) {
        this.currentOrgNodeStatus = OrgNodeStatus.None;
        this.isAddOrEditMode = false;
        this.isOrgNodeEmpty = true;
        if (addedNode.NodeID !== -1) {
            // gets the stagged node and deleting it
            if (this.orgNodes[0]) {
                let node = this.getNode(-1, this.orgNodes[0]);
                this.deleteNodeFromArray(node, this.orgNodes);
            }
            this.selectedOrgNode = addedNode;
            this.searchedNode = addedNode;
            this.isOrgNodeEmpty = false;
            this.currentOrgNodeStatus = OrgNodeStatus.Add;
        }

        if (addedNode.IsNewRoot) {
            this.orgNodes.splice(0, 1, addedNode);
            this.isOrgNodeEmpty = false;
        }
        else {
            this.addChildToSelectedOrgNode(addedNode, this.orgNodes[0]);
        }

        if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== addedNode.NodeID) {
            this.updateJSON(addedNode);
        } else {
            this.updateJSON();
        }
    }

    onSwitchedToAddMode(node: OrgNodeModel) {
        this.isAddOrEditMode = true;
        this.selectedOrgNode = node;
        this.disableViewAndExploreModesNav();
    }

    onAddOrEditModeValueSet(value: boolean) {
        this.isAddOrEditMode = value;
        if (this.tutorialStatus === TutorialMode.Continued) {
            this.enableViewModesNav(ChartMode.tutorial);
            return;
        }
        if (value) {
            this.disableViewAndExploreModesNav();
        } else {
            this.enableViewModesNav(this.currentChartMode);
        }
    }

    addChildToSelectedOrgNode(newNode: OrgNodeModel, node: OrgNodeModel) {
        if (node) {
            if (this.comparewithParentNodeID(newNode, node)) {
                newNode.IsSelected = true;
                if (!node.children) {
                    node.children = new Array<OrgNodeModel>();
                }
                node.children.push(newNode);
                return true;
            } else {
                node.IsSelected = false;
                if (node.children) {
                    for (let i = 0; i < node.children.length; i++) {
                        let result = this.addChildToSelectedOrgNode(newNode, node.children[i]);
                        if (result) {
                            break;
                        }
                    }
                }
            }
        } else {
            newNode.IsSelected = true;
            newNode.IsStaging = false;
            newNode.children = new Array<OrgNodeModel>();
            this.orgNodes.push(newNode);
            return true;
        }
    }

    replacer(key, value) {
        if (typeof key === "parent") {
            return undefined;
        }
        return value;
    }

    removeCircularRef(node) {
        if (node) {
            node.parent = null;
            if (node.children == null && node._children != null) {
                node.children = node._children;
            }
            node._children = null;
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    this.removeCircularRef(node.children[i]);
                }
            }
        }
    }

    updateJSON(addedNode?: OrgNodeModel) {
        this.removeCircularRef(this.orgNodes[0]);
        this.orgGroup.OrgNodes = JSON.parse(JSON.stringify(this.orgNodes));
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        if (addedNode && addedNode.NodeID === -1) {
            this.searchedNode = this.getNode(addedNode.NodeID, this.treeJson[0]);
            this.selectedOrgNode = this.searchedNode;
        }
        if ((this.treeJson && this.treeJson.length === 0) || (this.selectedOrgNode && this.selectedOrgNode.NodeID === -1)) {
            this.disableViewAndExploreModesNav();
        }
    }

    deleteNodeFromArray(selectedNode: OrgNodeModel, nodes: OrgNodeModel[]) {
        let index = - 1;
        for (let i = 0; i < nodes.length; i++) {
            if (this.compareNodeID(nodes[i], selectedNode)) {
                index = nodes.indexOf(nodes[i]);
                break;
            }
        };
        if (index > -1) {
            nodes.splice(index, 1);
            this.selectedOrgNode = null;
        } else {
            for (let i = 0; i < nodes.length; i++) {
                let element = nodes[i];
                if (element.children) {
                    this.deleteNodeFromArray(selectedNode, element.children);
                }
            }
        }
    }

    deleteTutorialNodes(data: boolean) {
        if (data) {
            if (this.orgNodes[0]) {
                this.onNodeDeleted(this.orgNodes[0]);
            }
        }
    }

    detailPanelClosedStatus(data: boolean) {
        this.isDetailPanelClosed = data;
    }

    onNodeDeleted(deleted) {
        this.currentOrgNodeStatus = OrgNodeStatus.None;
        this.isAddOrEditMode = false;
        if (deleted) {
            if (deleted.IsNewRoot) {
                let oldRoot = deleted.children[0];
                oldRoot.ParentNodeID = null;
                this.orgNodes.splice(0, 1, oldRoot);
            }
            else {
                this.deleteNodeFromArray(deleted, this.orgNodes);
            }
            if (deleted.NodeID !== -1) {
                this.currentOrgNodeStatus = OrgNodeStatus.Delete;
            }
        } else {
            let node = this.getNode(this.selectedOrgNode.NodeID, this.orgNodes[0]);
            this.selectedOrgNode = JSON.parse(JSON.stringify(node));
        }
        if (this.orgNodes && this.orgNodes.length === 0) {
            this.isOrgNodeEmpty = true;
        } else {
            this.isOrgNodeEmpty = false;
        }
        this.updateJSON();
    }


    onUpdateNodeAndDeleteNode(childNode: OrgNodeModel) {
        let node: OrgNodeModel = this.getNode(this.selectedOrgNode.ParentNodeID, this.orgNodes[0]);
        if (node) {
            node.children.push(childNode);
            this.updateOrgNode(this.orgNodes[0], node);
            this.deleteNodeFromArray(this.selectedOrgNode, this.orgNodes);
        } else if (this.selectedOrgNode.ParentNodeID === null) {
            this.deleteNodeFromArray(this.selectedOrgNode, this.orgNodes);
            this.orgNodes.push(childNode);
        }
        this.currentOrgNodeStatus = OrgNodeStatus.Delete;
        this.searchedNode = childNode;
        this.updateJSON();
    }

    onNodeUpdated(selected) {
        // since while updating data to server we send children as null so refreshing the value
        if (selected && !selected.children && selected.NodeID === this.selectedOrgNode.NodeID && this.selectedOrgNode.children) {
            selected.children = this.selectedOrgNode.children;
        }
        if (selected.NodeID !== -1) {
            this.selectedOrgNode = selected;
        }
        if (selected.NodeID !== -1 && selected.IsStaging) {
            // updating local changes
            this.orgGroup.OrgNodes = JSON.parse(JSON.stringify(this.orgNodes));
            this.updateOrgNode(this.orgNodes[0], selected);
            this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        } else {
            // updating submitted or saved changes
            this.updateOrgNode(this.orgNodes[0], selected);
            this.updateJSON();
        }
    }

    updateOrgNode(node: OrgNodeModel, selectedNode) {
        if (this.compareNodeID(node, selectedNode)) {
            node.NodeFirstName = selectedNode.NodeFirstName;
            node.NodeLastName = selectedNode.NodeLastName;
            node.Description = selectedNode.Description;
            node.ParentNodeID = selectedNode.ParentNodeID;
            node.IsSelected = true;
            return true;
        } else {
            node.IsSelected = false;
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    let result = this.updateOrgNode(node.children[i], selectedNode);
                    if (result) {
                        break;
                    }
                }
            }
        }
    }

    onChartUpdated(data: any) {
        this.currentOrgNodeStatus = OrgNodeStatus.Add;
        this.onGroupSelected(data);
    }

    onGroupSelected(data: any) {
        this.orgGroup = data;
        this.orgNodes = JSON.parse(JSON.stringify(this.orgGroup.OrgNodes));
        this.companyID = this.orgGroup.CompanyID;
        if (this.orgNodes && this.orgNodes.length === 0) {
            this.disableViewAndExploreModesNav();
            this.currentChartMode = ChartMode.build;
            this.disablePan();
        }
        this.enableViewModesNav(this.currentChartMode);
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        this.isSmartBarEnabled = false;
        this.isEditModeEnable = false;
        this.onAddOrEditModeValueSet(false);
        if (this.treeJson && this.treeJson.length === 0) {
            this.isOrgNodeEmpty = true;
        }
    }

    onMenuSettingsChange(data: boolean) {
        if (data) {
            this.isMenuSettingsEnabled = data;
        } else {
            this.isMenuSettingsEnabled = data;
        }
    }

    onNodeSearched(data: OrgNodeModel) {
        this.searchedNode = data;
    }

    onNodeMoved(data: DraggedNode) {
        if (data) {
            let node = this.getNode(data.NodeID, this.orgNodes[0]);
            this.deleteNodeFromArray(node, this.orgNodes);
            node.ParentNodeID = data.ParentNodeID;
            this.addChildToSelectedOrgNode(node, this.orgNodes[0]);
            this.orgService.changeParent(node).subscribe(data => this.updateJSON(),
                err => this.orgService.logError(err));
        }
    }

    verticalNodeSpace(data: number) {
        this.verticalSpaceForNode = data;
    }

    horizontalNodeSpace(data: number) {
        this.horizontalSpaceForNode = data;
    }

    onTutorialModeChanged(data: TutorialMode) {
        if (data === TutorialMode.Skiped) {
            this.isTutorialModeEnabled = false;
            this.changedStateForTutorial(TutorialNodeState.None);
            this.enableViewModesNav(this.currentChartMode);
        } else if (data === TutorialMode.Continued) {
            this.enableViewModesNav(ChartMode.tutorial);
            if (!this.isTutorialModeEnabled) {
                this.isTutorialModeEnabled = true;
            }
            if (this.tutorialStatus !== TutorialMode.Interupted) {
                this.changedStateForTutorial(TutorialNodeState.None);
            }
        }
        this.tutorialStatus = data;
    }

    onTutorialEnable(data: boolean) {
        this.isTutorialModeEnabled = data;
        this.enableViewModesNav(ChartMode.tutorial);
        if (this.isTutorialModeEnabled)
            this.tutorialStatus = TutorialMode.Started;
    }

    private enableViewModesNav(viewMode) {
        if (viewMode === ChartMode.explore) {
            this.exploreView = "active";
            this.reportView = "";
            this.buildView = "";
        } else if (viewMode === ChartMode.report) {
            this.buildView = "";
            this.exploreView = "";
            this.reportView = "active";
        } else if (viewMode === ChartMode.tutorial) {
            this.buildView = "";
            this.exploreView = "";
            this.reportView = "";
        } else {
            this.buildView = "active";
            this.reportView = "";
            this.exploreView = "";
        }
    }

    private disableViewAndExploreModesNav() {
        this.reportView = "inactive";
        this.exploreView = "inactive";
    }

    private getSvgHeight() {
        let height = window.innerHeight;
        if (height > MIN_HEIGHT) {
            if (window.innerWidth < MIN_WIDTH) {
                return height - (DEFAULT_OFFSET * 2);
            }
            return height - DEFAULT_OFFSET;
        }
        return MIN_HEIGHT;
    }

    private getSvgWidth() {
        let width = window.innerWidth;
        if (width < WINDOW_MIN_WIDTH) {
            width = WINDOW_MIN_WIDTH;
        }
        return width;
    }

    private getNode(nodeID: number, rootNode: any) {
        if (rootNode.NodeID === nodeID) {
            return rootNode;
        } else {
            let nodes = rootNode.children ? rootNode.children : rootNode._children;
            if (nodes) {
                let node;
                for (let i = 0; i < nodes.length; i++) {
                    if (!node) {
                        node = this.getNode(nodeID, nodes[i]);
                    }
                };
                return node;
            }
        }
    }

    private comparewithParentNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.ParentNodeID === currentNode.NodeID;
        } else {
            return false;
        }
    }

    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.NodeID === currentNode.NodeID;
        } else {
            return false;
        }
    }

    private disablePan() {
        if (this.svgPan) {
            this.svgPan.disablePan();
        }
    }

    private enablePan() {
        if (!this.svgPan) {
            let elem = document.getElementsByTagName("svg")[0];
            this.svgPan = svgPanZoom(elem, {
                viewportSelector: ".svg-pan-zoom_viewport",
                panEnabled: true,
                controlIconsEnabled: false,
                zoomEnabled: false,
                dblClickZoomEnabled: false,
                mouseWheelZoomEnabled: false,
                preventMouseEventsDefault: true
            });
        } else {
            this.svgPan.enablePan();
        }
    }

    ngOnDestroy() {
        if (this.svgPan) {
            this.svgPan.destroy();
        }
    }

}