import { IsOptional, IsString, MaxLength, MinLength, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, OnboardingStep } from '@common/enums';

export class UpdateUserDto {
    @ApiProperty({ example: 'John', required: false })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @IsOptional()
    firstName?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @IsOptional()
    lastName?: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @IsString()
    @MaxLength(100)
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Pakistan', required: false })
    @IsString()
    @MaxLength(50)
    @IsOptional()
    country?: string;

    @ApiProperty({ example: 'Karachi', required: false })
    @IsString()
    @MaxLength(50)
    @IsOptional()
    city?: string;

    @ApiProperty({ example: '12345', required: false })
    @IsString()
    @MaxLength(10)
    @IsOptional()
    postalCode?: string;

    @ApiProperty({ example: 'male', required: false })
    @IsString()
    @MaxLength(20)
    @IsOptional()
    gender?: string;

    @ApiProperty({ example: 'Street 1, Block A', required: false })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    addressLine1?: string;

    @ApiProperty({ example: 'Near Shopping Mall', required: false })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    addressLine2?: string;

    @ApiProperty({ example: 1, required: false, enum: OnboardingStep })
    @IsEnum(OnboardingStep)
    @IsOptional()
    onboardingStep?: OnboardingStep;

    @ApiProperty({ example: 1, required: false })
    @IsNumber()
    @IsOptional()
    status?: number;

    @ApiProperty({ example: 'profile-image-url', required: false })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    image?: string;

    @ApiProperty({ example: 'fcm-token-string', required: false })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    fcmToken?: string;

    @ApiProperty({ example: 24.8607, required: false })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiProperty({ example: 67.0011, required: false })
    @IsNumber()
    @IsOptional()
    longitude?: number;
}