import {OrgNodeModel} from "./orgnode.model";

export class OrgGroupModel {
    CompanyID: number;
    GroupName: string;
    IsDefaultGroup: boolean;
    OrgGroupID: number;
    OrgNodes: OrgNodeModel[];
    DefaultParentNodeId: number;
    OrgNodeCounts: number;
}
