import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";



export class RegisterDTO {
    @IsNotEmpty()
    @IsString()
    firstname: string

    @IsNotEmpty()
    @IsString()
    lastname: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
    
    @IsNotEmpty()
    @IsString()
    password2: string
    
    hireDate: Date

    
}

enum Role {
    SUPERADMIN,
    ADMIN,
    MANAGER,
    RECEPTIONIST,
    STAFF,
    GUEST
  }