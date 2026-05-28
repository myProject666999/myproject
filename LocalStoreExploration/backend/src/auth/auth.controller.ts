import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  username: string;
  password: string;
}

class RegisterDto {
  username: string;
  password: string;
  nickname: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.username, body.password, body.nickname);
  }
}
