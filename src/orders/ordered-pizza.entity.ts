import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderedPizzaComponent } from './ordered-pizza-component.entity';
import { Order } from './order.entity';

@Entity()
export class OrderedPizza {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  orderId: number;

  @ManyToOne(() => Order, (user) => user.pizzas, {})
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @OneToMany(() => OrderedPizzaComponent, (i) => i.pizza, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  components: OrderedPizzaComponent[];

  @Column({})
  additionalRequests: string;
}
