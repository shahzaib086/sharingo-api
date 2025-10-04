import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { generateOtp } from '../utils/global.util';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { OnboardingStep } from '../common/enums/user.enum';

type AuthInput = {
  email: string;
  password: string;
  fcmToken?: string;
};

type SignInData = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  country_code: string;
  phone_number: string;
};

type AuthResponse = {
  id: number;
  accessToken: string;
};

type GoogleUserInfo = {
  sub: string; // Google ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    // Initialize Google OAuth client
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async authenticate(authInput: AuthInput): Promise<AuthResponse> {
    const user = await this.validateUser(authInput);

    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    // Update FCM token if provided
    if (authInput.fcmToken) {
      await this.usersService.updateFcmToken(user.id, authInput.fcmToken);
    }

    return await this.signIn(user);
  }

  async validateUser(authInput: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findByEmailWithPassword(authInput.email);
    if (!user) {
      return null;
    }

    if(!(await bcrypt.compare(authInput.password, user.password))) {
      return null;
    }

    const signInData: SignInData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country_code: user.countryCode,
      phone_number: user.phoneNumber,
    };

    return signInData;
  }

  async signIn(user: SignInData): Promise<AuthResponse> {
    const accessToken = await this.jwtService.signAsync(user);
    return {
      accessToken,
      id: user.id,
    };
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    try {
      // Verify the Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload() as GoogleUserInfo;
      
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // Check if user exists
      let user = await this.usersService.findByEmail(payload.email);

      if (user) {
        // User exists, update Google info
        await this.usersService.update(user.id, {
          googleId: payload.sub,
          googlePicture: payload.picture,
          isEmailVerified: payload.email_verified,
          firstName: payload.given_name,
          lastName: payload.family_name,
        });
      } else {
        // Create new user
        user = await this.usersService.create({
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          name: payload.name,
          googleId: payload.sub,
          googlePicture: payload.picture,
          isEmailVerified: payload.email_verified,
          isPhoneVerified: true, // Google users are considered verified
          password: '',
        });
      }

      const signInData: SignInData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country_code: user.countryCode,
        phone_number: user.phoneNumber,
      };

      return await this.signIn(signInData);
    } catch (error) {
      console.error('Google login error:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async signup(signupInput: SignupDto): Promise<{ userId: number }> {
    const existingUser = await this.usersService.findByEmail(signupInput.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(signupInput.password, 10);
    // Generate 4-digit OTP for verification
    const otp = generateOtp();
    const user = await this.usersService.create({
      firstName: signupInput.firstName,
      lastName: signupInput.lastName,
      email: signupInput.email,
      countryCode: signupInput.countryCode,
      phoneNumber: signupInput.phoneNumber,
      password: hashedPassword,
      otp,
      onboardingStep: OnboardingStep.ACCOUNT_CREATION,
    });
    return { userId: user.id };
  }

  async resendOtp(userId: number): Promise<{ userId: number }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const otp = generateOtp();
    await this.usersService.update(user.id, { otp });
    return { userId: user.id };
  }

  async verifyOtp({ userId, otp }: VerifyOtpDto): Promise<AuthResponse> {
    const user = await this.usersService.findOne(userId);
    if (!user || user.otp !== otp) {
      throw new BadRequestException('Invalid OTP or userId');
    }
    await this.usersService.update(user.id, {
      isPhoneVerified: true,
      otp: undefined,
      onboardingStep: OnboardingStep.OTP_VERIFICATION,
    });

    const signInData: SignInData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country_code: user.countryCode,
      phone_number: user.phoneNumber,
    };

    return await this.signIn(signInData);
  }

  async forgotPassword({
    email,
  }: ForgotPasswordDto): Promise<{ userId: number }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const otp = generateOtp();
    await this.usersService.update(user.id, { otp });
    // TODO: Send OTP via email/SMS here
    return { userId: user.id };
  }

  async resetPassword({
    userId,
    otp,
    newPassword,
  }: ResetPasswordDto): Promise<{ userId: number }> {
    const user = await this.usersService.findOne(userId);
    console.log('user', user?.otp, otp);
    if (!user || user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }
    return await this.updatePassword(user.id, newPassword);
  }

  async updatePassword(userId: number, newPassword: string, oldPassword?: string): Promise<{ userId: number }> {
    if( oldPassword ){
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // Get user with password for comparison
      const userWithPassword = await this.usersService.findByEmailWithPassword(user.email);
      if (!userWithPassword || !(await bcrypt.compare(oldPassword, userWithPassword.password))) {
        throw new BadRequestException('Old password is incorrect');
      }
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, {
      password: hashedPassword,
      otp: '',
    });
    return { userId: userId };
  }

  async getUserInfo(userId: number): Promise<User> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async deleteAccount(userId: number): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // TODO: Delete also entities linked to the user
    // Delete the user account
    await this.usersService.remove(userId);
    
    return true;
  }
}
