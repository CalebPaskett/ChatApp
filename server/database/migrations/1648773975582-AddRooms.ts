import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class AddRooms1648773975582 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'chat_room',
              columns: [
                {
                  name: 'id',
                  type: 'int',
                  isPrimary: true,
                  isGenerated: true,
                },
                {
                  name: 'lat',
                  type: 'double precision',
                },
                {
                    name: 'long',
                    type: 'double precision',
                  },
                {
                  name: 'roomkey',
                  type: 'text',
                  isUnique: true,
                },
              ],
            }),
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('chat_room');
    }

}
