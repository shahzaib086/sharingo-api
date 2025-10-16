import {
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
  Body,
  Post,
  Get,
  Request,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { SignupDto } from './dto/signup.dto';
import { DefaultResponseDto } from '@common/dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() payload: LoginDto) {
    const response = await this.authService.authenticate(payload);
    return new DefaultResponseDto('Login successful', true, response);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: GoogleLoginDto })
  @Post('google-login')
  async googleLogin(@Body() payload: GoogleLoginDto) {
    const response = await this.authService.googleLogin(payload.idToken);
    return new DefaultResponseDto('Google login successful', true, response);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signup(@Body() signupInput: SignupDto) {
    const response = await this.authService.signup(signupInput);
    return new DefaultResponseDto(
      'Verification code sent to email',
      true,
      response,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const response = await this.authService.verifyOtp(verifyOtpDto);
    return new DefaultResponseDto('OTP verified successfully', true, response);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    const response = await this.authService.resendOtp(resendOtpDto.userId);
    return new DefaultResponseDto(
      'OTP resent successfully',
      true,
      response,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const response = await this.authService.forgotPassword(forgotPasswordDto);
    return new DefaultResponseDto(
      'OTP sent to your email/phone',
      true,
      response,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const response = await this.authService.resetPassword(resetPasswordDto);
    return new DefaultResponseDto('Password reset successful', true, response);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    console.log('Update Password Request:', updatePasswordDto, userId);
    const response = await this.authService.updatePassword(userId, updatePasswordDto.newPassword, updatePasswordDto.oldPassword);
    return new DefaultResponseDto(
      'Password updated successfully',
      true,
      response,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('delete-account')
  async deleteAccount(@Request() req: any) {
    const userId = req.user.id;
    const response = await this.authService.deleteAccount(userId);
    return new DefaultResponseDto('Account deleted successfully', true, response);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  async getUserInfo(@Request() req: any) {
    const user = req.user as User;
    const response = await this.authService.getUserInfo(user.id);
    return new DefaultResponseDto(
      'User info fetched successfully',
      true,
      response,
    );
  }
}
