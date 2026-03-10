import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID || 'not-configured';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'not-configured';
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });

    if (clientID === 'not-configured' || clientSecret === 'not-configured') {
      console.error('[GoogleStrategy] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables. Google OAuth will NOT work.');
    }
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
      this.logger.error('Google OAuth validation failed', err);
      done(err as Error, false);
    }
  }
}
