import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderedPizza } from './ordered-pizza.entity';

@Entity()
export class OrderedPizzaComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  pizzaId: number;

  @ManyToOne(() => OrderedPizza, (user) => user.components, {})
  @JoinColumn({ name: 'pizzaId' })
  pizza: OrderedPizza;

  @Column({})
  typeId: number;

  @Column({})
  componentId: number;

  @Column({})
  typeName: string;

  @Column({})
  typeMandatory: boolean;

  @Column({})
  typeMaximum: number;

  @Column({})
  name: string;

  @Column({})
  price: number;
}
