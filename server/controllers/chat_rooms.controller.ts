import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatRoom } from 'server/entities/chat_room.entity';
import { ChatRoomService } from 'server/providers/services/chat_room.service';
import * as crypto from 'crypto';

class ChatRoomBody {
  lat: number;
  long: number;
}

@Controller()
export class ChatRoomsController {
  constructor(private chatRoomService: ChatRoomService) {}

  @Get('/chat_rooms')
  async index() {
    const chatRooms = await this.chatRoomService.findAll();
    return { chatRooms };
  }

  @Get('/chat_rooms/:id')
  async show(@Param('id') id: string) {
    const chatRoom = await this.chatRoomService.findOne(parseInt(id));
    return { chatRoom };
  }

  @Post('/chat_rooms')
  async create(@Body() body: ChatRoomBody) {
    let chatRoom = new ChatRoom();
    chatRoom.lat = body.lat;
    chatRoom.long = body.long;
    chatRoom.roomkey = crypto.randomBytes(8).toString('hex');
    chatRoom = await this.chatRoomService.create(chatRoom);
    return { chatRoom };
  }
}