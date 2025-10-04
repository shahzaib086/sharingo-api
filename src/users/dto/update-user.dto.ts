import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, RelationshipStatus } from '@common/enums';

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
    gender?: Gender;

    @ApiProperty({ example: 'single', required: false })
    @IsString()
    @MaxLength(20)
    @IsOptional()
    relationshipStatus?: RelationshipStatus;

    @ApiProperty({ example: 'book1,book2,book3', required: false })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    books?: string;

}
