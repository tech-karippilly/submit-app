import { generateToken } from '../utils/jwt';
import { ITokenPayload } from '../types';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const login = async (input: LoginInput): Promise<LoginResponse> => {
  const { email, password } = input;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail || password !== adminPassword) {
    throw new Error('Invalid email or password');
  }

  const payload: ITokenPayload = {
    userId: 'admin',
    email,
    role: 'admin',
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateToken(payload);

  return {
    accessToken,
    refreshToken,
  };
};