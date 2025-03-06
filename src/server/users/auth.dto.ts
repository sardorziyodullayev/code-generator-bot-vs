import { JwtPayload } from 'jsonwebtoken';

export interface UserWTPayloadInterface extends JwtPayload {
  _id: string;
}

declare module 'express' {
  export interface Request {
    user?: UserWTPayloadInterface;
  }
}
