import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { PrismaService } from "prisma/prisma.service";



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        })
    }

    async validate(payload: any){
        const user = await this.prisma.user.findUnique({ where: {email: payload.email} })
        return user
    }
}