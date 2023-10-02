import { MigrationInterface, QueryRunner } from 'typeorm';
import { PizzaComponentType } from '../pizza-components/pizza-component-type.entity';
import { PizzaComponent } from '../pizza-components/pizza-component.entity';
import { PickWithout } from '../utils/typescriptUtils';

type PizzaComponentsByType = PickWithout<PizzaComponentType, 'id'> & {
  components: PickWithout<PizzaComponent, 'id' | 'type' | 'typeId'>[];
};

const componentTypes: PizzaComponentsByType[] = [
  {
    mandatory: true,
    maximum: 1,
    name: 'Dough Type',
    description:
      'Our pizzaria offers multiple types of bread and can satisfy many taste preferences',
    components: [
      { name: 'White Flour Dough', description: '', currentPrice: 1000 },
      { name: 'Wholegrain Dough', description: '', currentPrice: 1200 },
    ],
  },
  {
    mandatory: true,
    maximum: 1,
    name: 'Dough Thickness',
    description:
      'Want a pizza to thin and crispy or thick and bready? For a small extra charge, we can offer a pizza with a specific thickness.',
    components: [
      { name: 'Normal Thickness', description: '', currentPrice: 0 },
      { name: 'Extra Thick', description: '', currentPrice: 200 },
      { name: 'Thin', description: '', currentPrice: 200 },
    ],
  },
  {
    mandatory: true,
    maximum: 1,
    name: 'Pizza Sauce',
    description:
      'Pizzas commonly have tomato sauce, milk cream or butter on top of the dough',
    components: [
      { name: 'Tomato Sauce', description: '', currentPrice: 0 },
      { name: 'Milk Cream', description: '', currentPrice: 0 },
      { name: 'Butter', description: '', currentPrice: 0 },
    ],
  },
  {
    mandatory: true,
    maximum: 10,
    name: 'Standard Toppings',
    description:
      'Pizzas commonly have tomato sauce, milk cream or butter on top of the dough',
    components: [
      { name: 'American Cheese', description: '', currentPrice: 200 },
      { name: 'Asiago Cheese', description: '', currentPrice: 200 },
      { name: 'Blue Cheese', description: '', currentPrice: 200 },
      { name: 'Bocconcini Cheese', description: '', currentPrice: 200 },
      { name: 'Brie Cheese', description: '', currentPrice: 200 },
      { name: 'Burrata Cheese', description: '', currentPrice: 200 },
      { name: 'Camembert Cheese', description: '', currentPrice: 200 },
      { name: 'Cheddar Cheese', description: '', currentPrice: 200 },
      { name: 'Colby Cheese', description: '', currentPrice: 200 },
      { name: 'Cotija Cheese', description: '', currentPrice: 200 },
      { name: 'Cream Cheese', description: '', currentPrice: 200 },
      { name: 'Emmental Cheese', description: '', currentPrice: 200 },
      { name: 'Gouda Cheese', description: '', currentPrice: 200 },
      { name: 'Mozzarella Cheese', description: '', currentPrice: 200 },
      { name: 'Parmesan Cheese', description: '', currentPrice: 200 },
      { name: 'Swiss Cheese', description: '', currentPrice: 200 },
      { name: 'Pepperoni', description: '', currentPrice: 300 },
      { name: 'Bacon', description: '', currentPrice: 300 },
      { name: 'Ham', description: '', currentPrice: 300 },
      { name: 'Meatballs', description: '', currentPrice: 300 },
      { name: 'Italian sausage', description: '', currentPrice: 300 },
      { name: 'Prosciutto', description: '', currentPrice: 300 },
      { name: 'Salami', description: '', currentPrice: 300 },
      { name: 'Chicken', description: '', currentPrice: 300 },
      { name: 'Ground beef', description: '', currentPrice: 300 },
      { name: 'Seafood', description: '', currentPrice: 300 },
    ],
  },
  {
    mandatory: false,
    maximum: 3,
    name: 'Topping Sauce',
    description:
      'Pizzas commonly have tomato sauce, milk cream or butter on top of the dough',
    components: [
      { name: 'Barbecue sauce', description: '', currentPrice: 100 },
      { name: 'Marinara sauce', description: '', currentPrice: 100 },
      { name: 'Arrabiata', description: '', currentPrice: 100 },
      { name: 'Alfredo', description: '', currentPrice: 100 },
      { name: 'Ranch dressing', description: '', currentPrice: 100 },
      { name: 'Mediterranean dressing', description: '', currentPrice: 100 },
      { name: 'Herbed olive oil', description: '', currentPrice: 100 },
      { name: 'Garlic butter', description: '', currentPrice: 100 },
      { name: 'Fondue', description: '', currentPrice: 100 },
      { name: 'Aioli', description: '', currentPrice: 100 },
      { name: 'Blue cheese dressing', description: '', currentPrice: 100 },
      { name: 'Balsamic vinaigrette', description: '', currentPrice: 100 },
      { name: 'Whipped feta', description: '', currentPrice: 100 },
      { name: 'Pesto', description: '', currentPrice: 100 },
      { name: 'Hot honey', description: '', currentPrice: 100 },
      { name: 'Chili oil', description: '', currentPrice: 100 },
    ],
  },
];

export class Migration1696236271290 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const componentType of componentTypes) {
      const type: PickWithout<PizzaComponentType, 'id'> = {
        mandatory: componentType.mandatory,
        maximum: componentType.maximum,
        name: componentType.name,
        description: componentType.description,
      };

      await queryRunner.manager.insert(PizzaComponentType, type);

      for (const component of componentType.components) {
        await queryRunner.manager.insert(PizzaComponent, {
          ...component,
          typeId: (type as PizzaComponentType).id,
        });
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(PizzaComponent, {});
    await queryRunner.manager.delete(PizzaComponentType, {});
  }
}
