import { NextRequest } from 'next/server';
import { jwtService } from './jwt';

export async function getAuthUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = await jwtService.verifyToken(token);
    
    if (!payload || !payload.userId) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}