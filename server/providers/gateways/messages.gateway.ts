import { UseGuards } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { GatewayAuthGuard } from "../guards/gatewayauth.guard";
import { Server, Socket } from 'socket.io';

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

	constructor(private jwtService) {}
	
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
	async handleMessage(client: Socket, payload: ChatMessagePayload) {
    let newChatMessage = new chatMessage();
		newChatMessage.contents = payload.contents;
		newChatMessage.userName = payload.userName;
		newChatMessage.roomid = parseInt(client.handshake.query.chatRoomId as unknown as string, 10);
		
		this.server.to('${messsage.newChatMessageRoom}').emit('message', newChatMessage); //notify anyone connected to chatroom
	}
}
