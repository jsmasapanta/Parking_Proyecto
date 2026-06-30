import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener JWT' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('perfil')
  @ApiOperation({ summary: 'Ver perfil del usuario autenticado' })
  getPerfil(@Request() req: any) {
    return this.authService.getProfile(req.user);
  }
}
