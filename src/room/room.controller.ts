import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, NotFoundException } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomUploadFileTypeValidator } from 'src/validators/uploadFile.validator';
import { PrismaService } from 'prisma/prisma.service';




const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;
const VALID_UPLOADS_MIME_TYPES = ['image/jpeg', 'image/png'];


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GUEST)
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService, private prisma: PrismaService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }



  @Post(':roomId/images')
  @UseInterceptors(FileInterceptor('file'))
  uploadRoomImages(
    @Param('roomId') roomId: string,
    @UploadedFile(new ParseFilePipeBuilder().addValidator(new CustomUploadFileTypeValidator({ fileType: VALID_UPLOADS_MIME_TYPES}))
    .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
    .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})
    )
  file,
  ) {
      return this.roomService.uploadRoomImages(roomId, file)
      
  }

  @Get(':roomId/images')
  getRoomImages(@Param('roomId') roomId: string){
    return this.roomService.getRoomImages(roomId)
  }

  @Delete(':roomId/images')
  async deleteRoomImages(@Param('roomId') roomId: string) {

    return this.roomService.deleteRoomImages(roomId)

  }


  

    

}
