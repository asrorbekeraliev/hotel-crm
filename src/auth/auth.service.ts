import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDTO } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs'
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {

    constructor(private jwtService: JwtService, private prisma: PrismaService) {}

    async register(dto: RegisterDTO){
        const { firstname, lastname, email, password, password2, hireDate } = dto

        if(password !== password2){
            throw new BadRequestException('Passwords do not match')
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await this.prisma.user.create({
            data: {
                firstname, lastname, email, password: hashedPassword, hireDate, role: 'GUEST'
            }
        })

        return user


    }



    async login(dto: LoginDto){
        const { email, password } = dto

        const user = await this.prisma.user.findUnique({
            where: { email }
        })

        
        if(!user){
            throw new UnauthorizedException('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid){
            throw new UnauthorizedException('Invalid Credentials')
        }

        const payload = {email: user.email, role: user.role, firstname: user.firstname, lastname: user.lastname }
        
        const token = this.jwtService.sign(payload)

        return token


    }

}
