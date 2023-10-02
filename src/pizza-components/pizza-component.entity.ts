import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PizzaComponentType } from './pizza-component-type.entity';

/**
 * The concept behind PizzaComponent is to provide a data-driven algorithm for defining what is a valid pizza and what isn't.
 * 'PizzaComponentType' defines the types of components, while 'PizzaComponent' defines the options for these types.
 *
 * for example:
 * - type "Doe" can be "white", "wholegrain" or some other fancy bread types
 * - type "Doe Thickness" can be "normal", "ultra-thin" or "XXL" (notice that components can be modifiers for other components and not real physical things)
 * - type "Under-Sauce" can be "tomato", "cream", "butter" or "our specialty" (I call it "Under-Sauce", because I don't know the real name)
 * - type "Cheese" can be an array 0 to 5 of these elements: "chedar", "rockford", "parmesan", "cream", "kashkaval", "brie", "mozzarella"
 * - type "Meat" can be an array 0 to 4 of some other components. (meaning it's possible to get a pizza with 5 cheeses and 4 meats)
 *
 * Each component has a price.
 * In some cases that price might be "0". For example - Doe Thickness "Normal"
 * The final cost of the pizza will be the combined sum of the component prices.
 *
 * As for displaying this in the Frontend - it is actually easier that it looks.
 * There are only 4 scenarios that the frontend needs to be able to visualize:
 *
 * - Selection of components with type that is { mandatory: true, maximum: 1 } ======> MUST_CHOOSE_ONE
 * - Selection of components with type that is { mandatory: false, maximum: 1 } ======> CAN_CHOOSE_ONE
 * - Selection of components with type that is { mandatory: true, maximum: >1 } ======> MUST_CHOOSE_AT_LEAST_ONE
 * - Selection of components with type that is { mandatory: false, maximum: >1 } ======> CAN_CHOOSE_MANY
 */
@Entity()
export class PizzaComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  typeId: number;

  @ManyToOne(() => PizzaComponentType, (i) => i.id)
  @JoinColumn({ name: 'typeId' })
  type: PizzaComponentType;

  @Column({ unique: true })
  name: string;

  @Column({})
  description: string;

  @Column({})
  currentPrice: number;
}
