import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jperez', description: 'Nombre de usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'admin123', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}
