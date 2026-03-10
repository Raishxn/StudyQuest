import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AcademicProfileDto } from './dto/academic-profile.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async registerPhase1(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new BadRequestException('Email já cadastrado');

    const existingUsername = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existingUsername) throw new BadRequestException('Username já em uso');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
      },
    });

    const accessToken = await this.generateAccessToken(user.id, user.email, user.role);
    return { accessToken, user: { id: user.id, username: user.username, email: user.email } };
  }

  async registerPhase2(userId: string, dto: AcademicProfileDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        institutionId: dto.institutionId,
        courseId: dto.courseId,
        unidade: dto.unidade,
        semester: dto.semester,
        shift: dto.shift,
      },
    });
    return { message: 'Perfil acadêmico atualizado' };
  }

  async login(dto: LoginDto) {
    try {
      // Resolve user by email OR username
      const identifier = dto.email.trim();
      const isEmail = identifier.includes('@');

      const user = isEmail
        ? await this.prisma.user.findUnique({ where: { email: identifier } })
        : await this.prisma.user.findUnique({ where: { username: identifier } });

      if (!user || !user.passwordHash) {
        throw new UnauthorizedException('E-mail ou senha inválidos');
      }

      const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('E-mail ou senha inválidos');
      }

      const accessToken = await this.generateAccessToken(user.id, user.email, user.role);
      const refreshToken = await this.generateRefreshToken(user.id);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          level: user.level,
          title: user.title,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const err = error as any;
      console.error('[AuthService] login error:', err?.message, err?.stack);
      const isDev = process.env.NODE_ENV !== 'production';
      throw new InternalServerErrorException(
        isDev
          ? `Erro interno: ${err?.message || 'desconhecido'}`
          : 'Ocorreu um erro no servidor ao tentar fazer login.',
      );
    }
  }

  async refreshToken(userId: string, incomingToken: string) {
    const tokenHash = crypto.createHash('sha256').update(incomingToken).digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.userId !== userId || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
      }
      throw new UnauthorizedException('Token inválido ou expirado. Faça login novamente.');
    }

    await this.prisma.refreshToken.delete({ where: { tokenHash } });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const accessToken = await this.generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        level: true,
        xp: true,
        title: true,
      },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return { ...user, streak: 0 };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // Silent return para security

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });

    // TODO: Send Email logic using Queue / Nodemailer here
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRequest = await this.prisma.passwordReset.findUnique({
      where: { tokenHash },
    });

    if (!resetRequest || resetRequest.expiresAt < new Date() || resetRequest.usedAt) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId: resetRequest.userId },
      }),
    ]);
  }

  async findOrCreateGoogleUser(profile: { email: string; name: string; avatar: string; googleId: string }) {
    try {
      // Generate a unique username for potentially new users
      const baseUsername = profile.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;

      // Check if user already exists to avoid unnecessary username generation
      const existingUser = await this.prisma.user.findUnique({ where: { email: profile.email } });

      if (!existingUser) {
        // Only generate unique username for new users
        while (await this.prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }
      }

      const user = await this.prisma.user.upsert({
        where: { email: profile.email },
        update: {
          // Update avatar if user logs in via Google and had no avatar
          avatarUrl: existingUser?.avatarUrl || profile.avatar,
          emailVerified: true,
        },
        create: {
          email: profile.email,
          username,
          avatarUrl: profile.avatar,
          emailVerified: true,
        },
      });

      const accessToken = await this.generateAccessToken(user.id, user.email, user.role);
      const refreshToken = await this.generateRefreshToken(user.id);

      // Check if new/needs onboarding
      const needsOnboarding = !user.institutionId || !user.courseId;

      return { accessToken, refreshToken, user, needsOnboarding };
    } catch (error: any) {
      console.error('[AuthService] findOrCreateGoogleUser error:', error?.message, error?.stack);
      throw error;
    }
  }

  private async generateAccessToken(userId: string, email: string, role: string) {
    return this.jwtService.signAsync(
      { sub: userId, email, role },
      { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m' },
    );
  }

  private async generateRefreshToken(userId: string) {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresInDays = parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')?.replace('d', '') || '7');

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * expiresInDays),
      },
    });

    return refreshToken;
  }
}
