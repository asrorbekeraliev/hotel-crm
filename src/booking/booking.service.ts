import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'prisma/prisma.service';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';

@Injectable()
export class BookingService {

  constructor(private prisma: PrismaService) {}
  async create(createBookingDto: CreateBookingDto) {

    const { userId, roomId, checkInDate, checkOutDate } = createBookingDto

    // check if the room is available

    const overlappingBookings = await this.prisma.booking.findMany({
      where: {
        roomId: roomId,
        OR: [
          {
            checkInDate: {lte: new Date(checkOutDate) },
            checkOutDate: {gte: new Date(checkOutDate) }
          }
        ]
      }
    })

    if(overlappingBookings.length > 0){
      throw new ConflictException('Room is already booked for the selected dates')
    }

     // Fetch room price per night
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    const roomPricePerNight = room.pricePerNight;

    // Calculate number of nights
    const numberOfNights = this.calculateNights(new Date(checkInDate), new Date(checkOutDate));

    // Calculate total price
    const totalPrice = numberOfNights * roomPricePerNight;


    const newBooking = await this.prisma.booking.create({
      data: {
        userId,
        roomId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        totalPrice
      }
    })

    return newBooking;
  }

  async findAll() {
    const bookings = await this.prisma.booking.findMany()
    return bookings;
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where:{ id: id}
    })
    if(!booking) throw new NotFoundException('No booking found with this id')
    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const updatedBooking = await this.prisma.booking.update({
      where:{ id: id},
      data: updateBookingDto
    })

    return updatedBooking;
  }

  async remove(id: string) {
    try {
      const removedBooking = await  this.prisma.booking.delete({
        where: {id: id}
      })
      return removedBooking;
    } catch (error) {
      throw new NotFoundException('No booking found with this id')
    }
  }

  async findByRoomId(roomId: string){
    const allBookingsByRoomId = await this.prisma.booking.findMany({
      where:{ roomId: roomId}
    })

    return allBookingsByRoomId
  }

  private calculateNights(checkInDate: Date, checkOutDate: Date): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const differenceInTime = checkOut.getTime() - checkIn.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays;
  }
}
