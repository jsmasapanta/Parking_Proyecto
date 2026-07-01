import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

class RefreshDto {
  @ApiProperty({ description: 'Refresh token obtenido en el login' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener access + refresh token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token usando el refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto.refresh_token);
  }

  @Get('perfil')
  @ApiOperation({ summary: 'Ver perfil del usuario autenticado' })
  getPerfil(@Request() req: any) {
    return this.authService.getProfile(req.user);
  }
}
