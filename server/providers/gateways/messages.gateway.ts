import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, OnGatewayConnection,   MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { GatewayAuthGuard } from "../guards/gatewayauth.guard";
import { Server, Socket } from 'socket.io';
import { JwtService } from '../services/jwt.service';
import { GatewayJwtBody } from 'server/decorators/gateway_jwt_body.decorator';
import { JwtBodyDto } from 'server/dto/jwt_body.dto';

class ChatMessagePayload {
	contents: string;
	userName: string;
}

class chatMessage {
	contents: string;
	userName: string;
  roomid: number;
}

@WebSocketGateway()
@UseGuards(GatewayAuthGuard) //authenticates users
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(private jwtService: JwtService) {}
	
	handleConnection(client: any, ...args: any[]) {
    try {
      console.log('Client connected');
      const jwt = client.handshake.auth.token;
      this.jwtService.parseToken(jwt);
      console.log(client.handshake.query);
      client.join(client.handshake.query.chatRoomId as unknown as string);
    } catch (e) {
      throw new WsException('Invalid token');
    }
  }
	
	handleDisconnect(client: any) {
		console.log('Client was disconnected');
	}
	
	@SubscribeMessage('message') //takes type of message we want to subscribe to, calls this whenever that type is received
	async handleMessage( @ConnectedSocket() client: Socket, @MessageBody() payload: ChatMessagePayload, @GatewayJwtBody() jwtBody: JwtBodyDto,) {
		console.log("New message seen")
    let newChatMessage = new chatMessage();
		newChatMessage.contents = payload.contents;
		newChatMessage.userName = payload.userName;
		newChatMessage.roomid = parseInt(client.handshake.query.chatRoomId as unknown as string, 10);

		console.log("Message sent to others")
		this.server.to(`${newChatMessage.roomid}`).emit('message', newChatMessage); //notify anyone connected to chatroom
	}
}
