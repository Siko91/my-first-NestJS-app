import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PizzaComponentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  /**
   * If this is true, then a pizza will be considered invalid unless it has at least 1 such component.
   */
  @Column({})
  mandatory: boolean;

  /**
   * This defines how many ingredients of this type can a pizza have at maximum
   * For example - a pizza can only have 1 type of 'doe', but can have multiple types of 'sauce' (for example - up to 5)
   */
  @Column({})
  maximum: number;
}
