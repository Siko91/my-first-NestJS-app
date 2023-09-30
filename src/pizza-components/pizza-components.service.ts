import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PizzaComponentType } from './pizza-component-type.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { PizzaComponent } from './pizza-component.entity';
import {
  PizzaComponentDto,
  PizzaComponentTypeDto,
  UpdatePizzaComponentDto,
  UpdatePizzaComponentTypeDto,
} from './pizza-components.types';

@Injectable()
export class PizzaComponentsService {
  constructor(
    @InjectRepository(PizzaComponentType)
    private pizzaComponentTypeRepository: Repository<PizzaComponentType>,
    @InjectRepository(PizzaComponent)
    private pizzaComponentRepository: Repository<PizzaComponent>,
  ) {}

  async getComponentTypes() {
    return this.pizzaComponentTypeRepository.find();
  }

  async listComponents(
    filter: FindOptionsWhere<PizzaComponent>,
    searchString: string,
    sortBy: string,
    descending: boolean,
  ) {
    const whereFilter:
      | FindOptionsWhere<PizzaComponent>
      | FindOptionsWhere<PizzaComponent>[] =
      searchString === undefined
        ? { ...filter }
        : [
            { name: Like(`%${searchString}%`), ...filter },
            { description: Like(`%${searchString}%`), ...filter },
          ];

    const results = await this.pizzaComponentRepository.find({
      where: whereFilter,
      order:
        sortBy === undefined
          ? undefined
          : { [sortBy]: descending ? 'DESC' : 'ASC' },
    });
    return results;
  }

  async addComponentType(
    componentType: PizzaComponentTypeDto,
  ): Promise<PizzaComponentType> {
    const doc = this.pizzaComponentTypeRepository.create(componentType);
    await this.pizzaComponentTypeRepository.insert(doc);
    return doc;
  }

  async modifyComponentType(
    id: number,
    componentTypeUpdate: UpdatePizzaComponentTypeDto,
  ) {
    await this.pizzaComponentTypeRepository.update({ id }, componentTypeUpdate);
  }

  async deleteComponentType(id: number) {
    await this.pizzaComponentTypeRepository.delete({ id });
  }

  async addComponent(
    typeId: number,
    component: PizzaComponentDto,
  ): Promise<PizzaComponent> {
    const type = await this.pizzaComponentTypeRepository.findOneBy({
      id: typeId,
    });
    const doc = this.pizzaComponentRepository.create({ ...component, type });
    await this.pizzaComponentRepository.insert(doc);
    return doc;
  }

  async modifyComponent(id: number, component: UpdatePizzaComponentDto) {
    await this.pizzaComponentRepository.update({ id }, component);
  }

  async deleteComponent(id: number) {
    await this.pizzaComponentRepository.delete({ id });
  }
}
