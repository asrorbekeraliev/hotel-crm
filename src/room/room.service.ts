import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'prisma/prisma.service';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RoomService {

  constructor(private prisma: PrismaService) {}


  async create(createRoomDto: CreateRoomDto) {
    const { roomNumber, roomType, roomClass, roomStatus, pricePerNight } = createRoomDto

    const roomExist = await this.prisma.room.findFirst({
      where:{number: roomNumber}
    })

    if(roomExist){
      throw new UnprocessableEntityException('The room is already in database')
    }

    const room = await this.prisma.room.create({
      data: {
        number: roomNumber,
        class: roomClass,
        type: roomType,
        status: roomStatus,
        pricePerNight
      }
    })
    return room;
  }

  async findAll() {
    const rooms = await this.prisma.room.findMany()
    return rooms;
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: {
        id: id
      }
    })
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {

    try {
      const updatedRoom = await this.prisma.room.update({
        where: {id: id},
        data: updateRoomDto
      })
      return updatedRoom;
    } catch (error) {
      if(error.code === 'P2025'){
        throw new NotFoundException(`Room with ID ${id} not found`)
      }
      throw error
    }
    
  }

  async remove(id: string) {
    try {
      const deletedRoom = await this.prisma.room.delete({
        where: {id: id}
      })
      return deletedRoom;
    } catch (error) {
      if(error.code === 'P2025'){
        throw new NotFoundException(`Room with ID ${id} not found`)
      }
      throw error
    }

    
  }


  async uploadRoomImages(roomId: string, file){
    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const filePath = await this.saveFile(file, roomId);

    await this.prisma.room.update({
      where: { id: roomId },
      data: { imagePaths: { push: filePath } },
    });

    return 'File uploaded successfully !!!';
  }

  async getRoomImages(roomId: string){

    // Fetch room from the database
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Return the list of image paths
    return {
      roomId: roomId,
      images: room.imagePaths,
    };
  }

  async deleteRoomImages(roomId: string){
    // Fetch room from the database
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Delete all images from the file system
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', roomId);

    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        const filePath = path.join(uploadDir, file);
        fs.unlinkSync(filePath);
      });
      fs.rmdirSync(uploadDir);
    }

    // Update the room in the database to remove the image paths
    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        imagePaths: [],
      },
    });

    return 'All images deleted successfully !!!';
  }




  private async saveFile(file: Express.Multer.File, roomId: string): Promise<string> {
    // Implement your file saving logic here
    // For example, save the file to a directory named after the room ID
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', roomId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });        
    }

    // Define the file path relative to the uploads folder
    const relativeFilePath = path.join('uploads', roomId, file.originalname);
    const absoluteFilePath = path.join(uploadDir, file.originalname);
    
    fs.writeFileSync(absoluteFilePath, file.buffer);
    // Return the relative path or URL of the saved file
    return relativeFilePath;
  }
}
