import { RoomClass, RoomStatus, RoomType } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateRoomDto {
    @IsNumber()
    roomNumber: number

    @IsNotEmpty()
    roomType: RoomType

    @IsNotEmpty()
    roomClass: RoomClass

    @IsNotEmpty()
    roomStatus: RoomStatus

    @IsNotEmpty()
    @IsNumber()
    pricePerNight: number
}
