import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomsController } from 'server/controllers/chat_rooms.controller';
import { ChatRoom } from 'server/entities/chat_room.entity';
import { MessagesGateway } from 'server/providers/gateways/messages.gateway';
import { ChatRoomService } from 'server/providers/services/chat_room.service';
import { JwtService } from 'server/providers/services/jwt.service';
import { GuardUtil } from 'server/providers/util/guard.util';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom])],
  controllers: [ChatRoomsController],
  providers: [MessagesGateway, ChatRoomService, JwtService, GuardUtil],
  exports: [],
})
export class ChatRoomsModule {}