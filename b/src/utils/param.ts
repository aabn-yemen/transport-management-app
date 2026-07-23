import { Request } from 'express';

export function paramId(req: Request): string {
  return req.params.id as string;
}
