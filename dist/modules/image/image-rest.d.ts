import express from 'express';
export declare class ImageController {
    addImage(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void>;
    getImage(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void>;
}
