import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { OrderedPizzaComponent } from './ordered-pizza-component.entity';

@Entity()
export class OrderedPizza {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => OrderedPizzaComponent, (i) => i.id)
  @JoinTable()
  components: OrderedPizzaComponent[];

  @Column({})
  additionalRequests: string;
}
