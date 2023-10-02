import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1696235004414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "passwordHash" varchar NOT NULL, "email" varchar NOT NULL, "latestAuthId" varchar NOT NULL, "isAdmin" boolean, "fullName" varchar, "phone" varchar, "address" varchar, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))',
    );
    await queryRunner.query(
      'CREATE TABLE "pizza_component_type" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar, "mandatory" boolean NOT NULL, "maximum" integer NOT NULL, CONSTRAINT "UQ_45ca27848845f3817eb13c54564" UNIQUE ("name"))',
    );
    await queryRunner.query(
      'CREATE TABLE "pizza_component" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "typeId" integer NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "currentPrice" integer NOT NULL, CONSTRAINT "UQ_1e66340339a2a40c2217db39f3c" UNIQUE ("name"), CONSTRAINT "FK_0f6deecd36efcfc7c5a74b3987c" FOREIGN KEY ("typeId") REFERENCES "pizza_component_type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'CREATE TABLE "order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "orderTimestamp" datetime NOT NULL, "desiredDeliveryTime" datetime NOT NULL, "status" varchar NOT NULL, "address" varchar NOT NULL, "userEmail" varchar NOT NULL, "userPhone" varchar NOT NULL, "userFullName" varchar NOT NULL, "extraDeliveryInstructions" varchar, CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'CREATE TABLE "ordered_pizza" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "orderId" integer NOT NULL, "additionalRequests" varchar NOT NULL, CONSTRAINT "FK_ed95f1a7fa5bafc0aab2ff7e268" FOREIGN KEY ("orderId") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'CREATE TABLE "ordered_pizza_component" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "pizzaId" integer NOT NULL, "typeId" integer NOT NULL, "componentId" integer NOT NULL, "typeName" varchar NOT NULL, "typeMandatory" boolean NOT NULL, "typeMaximum" integer NOT NULL, "name" varchar NOT NULL, "price" integer NOT NULL, CONSTRAINT "FK_25a9ab63767e272f97b68606d39" FOREIGN KEY ("pizzaId") REFERENCES "ordered_pizza" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE 'user'");
    await queryRunner.query("DROP TABLE 'pizza_component_type'");
    await queryRunner.query("DROP TABLE 'pizza_component'");
    await queryRunner.query("DROP TABLE 'order'");
    await queryRunner.query("DROP TABLE 'ordered_pizza'");
    await queryRunner.query("DROP TABLE 'ordered_pizza_component'");
  }
}
