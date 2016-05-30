export class OrgNodeModel {
    Description: string;
    NodeFirstName: string;
    NodeLastName: string;
    NodeID: number;
    OrgID: number;
    ParentNodeID: number;
    IsSelected:boolean;
    Show:boolean;
    children: OrgNodeModel[];
}