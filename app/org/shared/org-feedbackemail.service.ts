import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Headers, RequestOptions } from "@angular/http";


@Injectable()
export class FeedBackEmailService {
    private origamiUrl = "//localhost:54574/";
    private headers: Headers;

    constructor(private http: Http) {
        this.headers = new Headers({ "Content-Type": "application/json" });
        this.headers.append("Accept", "application/json");
    }

    sendFeedback(userFeedback) {
        let feedbackUrl = "api/email/SendFeedback";
        let url = this.origamiUrl + feedbackUrl;

        return this.http.post(url, userFeedback, { headers: this.headers })
            .map(node => node.json());
    }

    logError(err: any) {
        console.error(err);
    }

}