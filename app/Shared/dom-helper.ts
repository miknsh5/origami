import { Injectable } from "@angular/core";

declare let jQuery: any;

@Injectable()
export class DOMHelper {

    public initTabControl() {
        setTimeout(() => {
            jQuery("ul.tabs").tabs();
            jQuery("input[id=verticalView]").prop("checked", true);
        }, 500);
    }

    public initDropDown(selector: string, options: any) {
        jQuery(selector).dropdown(options);
    }

    public initCollapsible() {
        jQuery(".collapsible").collapsible();
    }

    public setWidth(selector: string, width: any) {
        jQuery(selector).width(width);
    }

    public setHeight(selector: string, height: any) {
        jQuery(selector).height(height);
    }

    public showElements(selector: any) {
        jQuery(selector).show();
    }

    public hideElements(selector: any) {
        jQuery(selector).hide();
    }

    public addClass(selector: any, className: string): void {
        jQuery(selector).addClass(className);
    }

    public addMultipleClasses(selector: any, className: string): void {
        let styles: string[] = className.split(" ");
        for (let i = 0; i < styles.length; i++) {
            jQuery(selector).addClass(styles[i]);
        }
    }

    public removeClass(selector: any, className: string): void {
        jQuery(selector).removeClass(className);
    }

    public hasClass(selector: any, className: string): boolean {
        return jQuery(selector).hasClass(className);
    }

    public find(element: any, selector: string): any[] {
        return jQuery(element).find(selector);
    }

    public index(selector: string): number {
        let element = jQuery(selector);
        if (element) {
            let parent = jQuery(element).offsetParent();
            return jQuery(parent).index(element);
        }
        return -1;
    }

    public fadeIn(selector, duration: number): void {
        jQuery(selector).fadeIn(duration);
    }

    public fadeOut(selector, duration: number) {
        jQuery(selector).fadeOut(duration);
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