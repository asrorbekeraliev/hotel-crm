import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateBookingDto {
@IsNotEmpty()
userId: string

@IsNotEmpty()
roomId: string

@IsNotEmpty()
checkInDate: string

@IsNotEmpty()
checkOutDate: string

}

