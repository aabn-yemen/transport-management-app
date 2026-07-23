import { IJwtPayload } from '../shared/interfaces/base.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
    interface ParamsDictionary {
      [key: string]: string;
    }
  }
}

export {};
