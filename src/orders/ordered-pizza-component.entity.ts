import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OrderedPizzaComponent {
  @PrimaryGeneratedColumn()
  id: number;

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
