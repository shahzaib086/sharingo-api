import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(100)
  email: string;

  // @ApiProperty({ example: '+1' })
  // @IsString()
  // @MaxLength(10)
  // countryCode: string;

  // @ApiProperty({ example: '+1234567890' })
  // @IsString()
  // @MaxLength(20)
  // phoneNumber: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string;
}
