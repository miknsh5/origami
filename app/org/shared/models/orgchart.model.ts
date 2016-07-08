import {OrgNodeModel} from "./orgnode.model";

export class OrgChartModel {
    OrgID: number;
    UserID: string;
    OrganizationName: string;
    OrgNodes: OrgNodeModel[];
}