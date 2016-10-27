import { Injectable } from "@angular/core";

declare let $: any;

@Injectable()
export class DomElementHelper {

    public initTabControl() {
        setTimeout(() => {
            $("ul.tabs").tabs();
        }, 500);
    }

    public initDropDown(selector: string, options: any) {
        $(selector).dropdown(options);
    }

    public setWidth(selector: string, width: any) {
        $(selector).width(width);
    }

    public setHeight(selector: string, height: any) {
        $(selector).height(height);
    }

    public showElements(selector: any) {
        if (typeof selector === "string") {
            $(selector).fadeIn(500);
        } else {
            $(selector.join(", ")).fadeIn(500);
        }
    }

    public hideElements(selector: any) {
        if (typeof selector === "string") {
            $(selector).hide();
        } else {
            $(selector.join(", ")).hide();
        }
    }

    public addClass(selector: any, className: string): void {
        $(selector).addClass(className);
    }

    public addMultipleClasses(selector: any, className: string): void {
        let styles: string[] = className.split(" ");
        for (let i = 0; i < styles.length; i++) {
            $(selector).addClass(styles[i]);
        }
    }

    public removeClass(selector: any, className: string): void {
        $(selector).removeClass(className);
    }

    public hasClass(selector: any, className: string): boolean {
        return $(selector).hasClass(className);
    }

    public find(element: any, selector: string): any[] {
        return $(element).find(selector);
    }

    public index(selector: string): number {
        let element = $(selector);
        if (element) {
            let parent = $(element).offsetParent();
            return $(parent).index(element);
        }
        return -1;
    }

    public fadeIn(selector, duration: number): void {
        $(selector).fadeIn(duration);
    }

    public fadeOut(selector, duration: number) {
        $(selector).fadeOut(duration);
    }

    public getWindowScrollTop(): number {
        let doc = document.documentElement;
        return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    }

    public getWindowScrollLeft(): number {
        let doc = document.documentElement;
        return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    }

    public getOuterWidth(el, margin?) {
        let width = el.offsetWidth;
        if (margin) {
            let style = getComputedStyle(el);
            width += parseInt(style.paddingLeft) + parseInt(style.paddingRight);
        }
        return width;
    }

    public getHorizontalMargin(el) {
        let style = getComputedStyle(el);
        return parseInt(style.marginLeft) + parseInt(style.marginRight);
    }

    public getWidth(el) {
        let width = el.offsetWidth;
        let style = getComputedStyle(el);

        width += parseInt(style.paddingLeft) + parseInt(style.paddingRight);
        return width;
    }

    public getOuterHeight(el, margin?) {
        let height = el.offsetHeight;
        if (margin) {
            let style = getComputedStyle(el);
            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        }
        return height;
    }

    public getHeight(el): number {
        let height = el.offsetHeight;
        let style = getComputedStyle(el);
        height -= parseInt(style.paddingTop) + parseInt(style.paddingBottom) + parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
        return height;
    }

    public getViewport(): any {
        let win = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName("body")[0],
            w = win.innerWidth || e.clientWidth || g.clientWidth,
            h = win.innerHeight || e.clientHeight || g.clientHeight;
        return { width: w, height: h };
    }

    public getUserAgent(): string {
        return navigator.userAgent;
    }
}