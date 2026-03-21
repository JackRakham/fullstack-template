import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/bussines-error';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor() {
    super();
  }

  async validate(request: Request): Promise<any> {
    // Placeholder for Firebase validation logic
    // const token = request.headers['authorization'];
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // return { id: decodedToken.uid, email: decodedToken.email, provider: 'firebase' };
    
    throw new BusinessLogicException('Firebase authentication not implemented yet', BusinessError.PRECONDITION_FAILED);
  }
}
