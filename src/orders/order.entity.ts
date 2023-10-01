import { User } from '../users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { OrderedPizza } from './ordered-pizza.entity';

export enum OrderStatus {
  Registered = 'Registered',
  Accepted = 'Accepted',
  DeliveryStarted = 'DeliveryStarted',
  Delivered = 'Delivered',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => OrderedPizza, (i) => i.order, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  pizzas: OrderedPizza[];

  @Column({})
  userId: number;

  @ManyToOne(() => User, (i) => i.id, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({})
  orderTimestamp: Date;

  @Column({})
  desiredDeliveryTime: Date;

  @Column({})
  status: OrderStatus;

  @Column({})
  address: string;

  @Column({})
  userEmail: string;

  @Column({})
  userPhone: string;

  @Column({})
  userFullName: string;

  @Column({ nullable: true })
  extraDeliveryInstructions?: string;
}
