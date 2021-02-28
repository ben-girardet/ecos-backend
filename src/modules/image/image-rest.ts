import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { Controller, Get, Post } from '../../core/framework';
import multer from 'multer';
import path from 'path';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 24)

const uploadPath = process.env.UPLOAD_PATH || 'uploads/';

const storage = multer.diskStorage({
  destination: function (req: express.Request, file: Express.Multer.File, cb) {
    cb(null, uploadPath)
  },
  filename: function (req: express.Request, file: Express.Multer.File, cb) {

    let ext = '';
    if (file.mimetype === 'image/png') {
      ext = '.png';
    } else if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      ext = '.jpg';
    } else if (file.mimetype === 'image/gif') {
      ext = '.gif';
    }

    cb(null, nanoid() + ext) // appending extension
  }
})

const upload = multer({ storage })

@Controller('/image')
export class ImageController {

  @Post('/')
  async addImage(req: express.Request, res: express.Response, next: express.NextFunction) {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return next(err);
      }
      if (!req.file) {
        return next(new Error('Error while saving the image file'));
      }
      return res.status(StatusCodes.CREATED).send({id: req.file.filename});
    })
  }

  @Get('/:id')
  async getImage(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { id } = req.params;
    res.status(StatusCodes.OK);
    const filepath = path.join(__dirname, `../../../${uploadPath}${id}`);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.setHeader("Expires", new Date(Date.now() + 31536000000).toUTCString());
    res.download(filepath);
  }
}
