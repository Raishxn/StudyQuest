import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'missing_google_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing_google_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      const result = await this.authService.findOrCreateGoogleUser({
        googleId: profile.id || profile.emails[0].value,
        email: profile.emails[0].value,
        name: profile.displayName || profile.emails[0].value,
        avatar: profile.photos?.[0]?.value || null,
      });
      done(null, result);
    } catch (err) {
      done(err, false);
    }
  }
}
