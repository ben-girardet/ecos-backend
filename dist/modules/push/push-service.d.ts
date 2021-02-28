import { DocumentType } from '@typegoose/typegoose';
import { PushNotification } from './push-notification.model';
import express from 'express';
export declare class PushService {
    private push;
    private connected;
    isConnected(): boolean;
    connect(): void;
    disconnect(): void;
    send(notification: DocumentType<PushNotification>): Promise<any>;
}
declare const pushService: PushService;
export { pushService };
declare function testPush(req: express.Request, res: express.Response, next: express.NextFunction): void;
export { testPush };
