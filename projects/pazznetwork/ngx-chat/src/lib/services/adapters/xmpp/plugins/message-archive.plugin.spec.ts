import { TestBed } from '@angular/core/testing';
import { jid as parseJid } from '@xmpp/jid';
import { x as xml } from '@xmpp/xml';

import { Contact, Direction } from '../../../../core';
import { ContactFactoryService } from '../../../contact-factory.service';
import { LogService } from '../../../log.service';
import { XmppChatAdapter } from '../xmpp-chat-adapter.service';
import { XmppChatConnectionService, XmppClientToken } from '../xmpp-chat-connection.service';
import { MessageArchivePlugin } from './message-archive.plugin';


describe('message archive plugin', () => {

    let chatConnectionService: XmppChatConnectionService;
    let chatAdapter: XmppChatAdapter;
    let contactFactory: ContactFactoryService;
    let client;
    let logService: LogService;
    let contact1: Contact;
    const jid = 'somejid@example.com/test';

    const validArchiveStanza =
        xml('message', {},
            xml('result', {xmlns: 'urn:xmpp:mam:2'},
                xml('forwarded', {},
                    xml('delay', {stamp: '2018-07-18T08:47:44.233057Z'}),
                    xml('message', {to: jid, from: 'test@example.com/resource'},
                        xml('origin-id', {id: 'id'}),
                        xml('body', {}, 'message text')))));

    beforeEach(() => {
        client = jasmine.createSpyObj('Client', ['getValue', 'on', 'plugin', 'send', 'start', 'handle']);

        TestBed.configureTestingModule({
            providers: [
                {provide: XmppClientToken, useValue: client},
                XmppChatConnectionService,
                XmppChatAdapter,
                LogService,
                ContactFactoryService
            ]
        });

        chatConnectionService = TestBed.get(XmppChatConnectionService);
        contactFactory = TestBed.get(ContactFactoryService);
        chatAdapter = TestBed.get(XmppChatAdapter);
        logService = TestBed.get(LogService);
        contact1 = contactFactory.createContact('test@example.com', 'jon doe');
    });

    it('should send a request, create contacts and add messages ', () => {
        const messageArchivePlugin = new MessageArchivePlugin(chatAdapter);
        chatAdapter.addPlugins([messageArchivePlugin]);
        chatConnectionService.onOnline(parseJid(jid));

        chatConnectionService.onStanzaReceived(validArchiveStanza);

        const contacts = chatAdapter.contacts$.getValue();
        expect(contacts.length).toEqual(1);
        expect(contacts[0].jidBare).toEqual(contact1.jidBare);

        const messages = contacts[0].messages;
        expect(messages.length).toEqual(1);
        expect(messages[0].body).toEqual('message text');
        expect(messages[0].direction).toEqual(Direction.in);
        expect(messages[0].datetime).toEqual(new Date('2018-07-18T08:47:44.233057Z'));
    });

    it('should not request messages if message archive plugin is not set ', () => {
        chatConnectionService.onOnline(jid);

        chatConnectionService.onStanzaReceived(validArchiveStanza);

        expect(chatAdapter.contacts$.getValue()).toEqual([]);
    });

});
