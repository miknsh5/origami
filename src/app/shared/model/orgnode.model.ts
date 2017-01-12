export class OrgNodeModel {
    Description: string;
    NodeFirstName: string;
    NodeLastName: string;
    NodeID: number;
    OrgGroupID: number;
    ParentNodeID: number;
    CompanyID: number;
    IsSelected: boolean;
    Show: boolean;
    IsSibling: boolean;
    IsParent: boolean;
    IsChild: boolean;
    IsStaging: boolean;
    IsAncestor: boolean;
    children: OrgNodeModel[];
    IsFakeRoot: boolean;
    IsNewRoot: boolean;
}