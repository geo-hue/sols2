import { Express } from 'express-serve-static-core';
import { User } from '../src/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};