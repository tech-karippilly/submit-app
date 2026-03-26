import jwt, { SignOptions } from 'jsonwebtoken';
import { ITokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

export const generateToken = (payload: ITokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): ITokenPayload => {
  return jwt.verify(token, JWT_SECRET) as ITokenPayload;
};
