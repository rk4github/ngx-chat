import { PlatformLocation } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'lib-chat-message-link',
    templateUrl: './chat-message-link.component.html',
    styleUrls: ['./chat-message-link.component.less']
})
export class ChatMessageLinkComponent implements OnInit {

    link: string;
    text: string;

    constructor(private router: Router, private platformLocation: PlatformLocation) { }

    ngOnInit() {
    }

    onClick($event: Event) {
        $event.preventDefault();
        if (this.isInApp()) {
            const linkParser = document.createElement('a');
            linkParser.href = this.link;
            this.router.navigateByUrl(linkParser.pathname);
        } else {
            window.open(this.link, '_blank');
        }
    }

    private isInApp() {
        return this.link.startsWith(this.appUrl());
    }

    private appUrl() {
        return window.location.protocol + '//' + window.location.host + this.platformLocation.getBaseHrefFromDOM();
    }
}