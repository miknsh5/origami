import { OrgGroupModel } from "./orggroup.model";

export class OrgCompanyModel {
    CompanyID: any;
    CompanyName: string;
    DateCreated: string;
    IsDefaultCompany: boolean;
    OrgGroups: OrgGroupModel[];
    OrgNodeCounts: number;
}