import { OrgCompanyModel } from "./orgcompany.model";
export class UserDetails {
    UserID: string;
    UserName: string;
    UserEmailID: string;
    Picture: string;
    Company: OrgCompanyModel[];
}