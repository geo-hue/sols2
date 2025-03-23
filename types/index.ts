import { Request } from 'express';

export interface FileRequest extends Request {
  files: {
    [fieldname: string]: Express.Multer.File[];
  };
}