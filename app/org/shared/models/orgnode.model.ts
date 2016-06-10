export class OrgNodeModel {
    Description: string;
    NodeFirstName: string;
    NodeLastName: string;
    NodeID: number;
    OrgID: number;
    ParentNodeID: number;
    IsSelected: boolean;
    Show: boolean;
    IsSibling: boolean;
    IsGrandParent: boolean;
    IsAncestor: boolean;
    IsParent: boolean;
    IsChild: boolean;
    IsStaging: boolean;
    children: OrgNodeModel[];
}