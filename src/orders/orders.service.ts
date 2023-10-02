import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PizzaComponentType } from '../pizza-components/pizza-component-type.entity';
import { PizzaComponent } from '../pizza-components/pizza-component.entity';
import { DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { OrderedPizzaComponent } from './ordered-pizza-component.entity';
import { OrderedPizza } from './ordered-pizza.entity';
import { Order, OrderStatus } from './order.entity';
import { OrderDto } from './orders.types';
import { runInTransaction } from '../utils/typeorm';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PizzaComponentType)
    private pizzaComponentTypeRepository: Repository<PizzaComponentType>,
    @InjectRepository(PizzaComponent)
    private pizzaComponentRepository: Repository<PizzaComponent>,
    @InjectRepository(OrderedPizzaComponent)
    private orderedPizzaComponentRepository: Repository<OrderedPizzaComponent>,
    @InjectRepository(OrderedPizza)
    private orderedPizzaRepository: Repository<OrderedPizza>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async parseOrder(user: User, order: OrderDto): Promise<Order> {
    const orderDoc = this.orderRepository.create({
      status: user.isAdmin
        ? order.status ?? OrderStatus.Registered
        : OrderStatus.Registered,
      address: order.address ?? user.address,
      userEmail: order.userEmail ?? user.email,
      userPhone: order.userPhone ?? user.phone,
      userFullName: order.userFullName ?? user.fullName,
      extraDeliveryInstructions: order.extraDeliveryInstructions,
      orderTimestamp: new Date(),
      desiredDeliveryTime: order.desiredDeliveryTime,
      user: user,
      pizzas: [],
    });

    for (const pizza of order.pizzas) {
      const pizzaDoc = this.orderedPizzaRepository.create({
        additionalRequests: pizza.additionalRequests,
        components: [],
      });

      for (const { componentId } of pizza.components) {
        const componentDoc = await this.pizzaComponentRepository.findOne({
          where: { id: componentId },
          relations: ['type'],
        });

        const orderComponentDoc = this.orderedPizzaComponentRepository.create({
          typeId: componentDoc.type.id,
          componentId: componentId,
          typeMandatory: componentDoc.type.mandatory,
          typeMaximum: componentDoc.type.maximum,
          typeName: componentDoc.type.name,
          price: componentDoc.currentPrice,
          name: componentDoc.name,
        });

        pizzaDoc.components.push(orderComponentDoc);
      }

      orderDoc.pizzas.push(pizzaDoc);
    }

    return orderDoc;
  }

  async validatePizza(pizza: OrderedPizza) {
    const types = await this.pizzaComponentTypeRepository.find();
    const mandatoryTypes = types.filter((i) => i.mandatory);
    const requestedTypeIds = pizza.components
      .map((i) => i.typeId)
      .filter((v, i, arr) => arr.indexOf(v) === i);

    const requestedComponentsByType = requestedTypeIds.map((typeId) =>
      pizza.components.filter((i) => i.typeId === typeId),
    );

    for (const mandatoryType of mandatoryTypes) {
      if (requestedTypeIds.indexOf(mandatoryType.id) < 0) {
        throw new Error(
          `Pizza must contain a component of type "${mandatoryType.name}"`,
        );
      }
    }

    for (let i = 0; i < requestedTypeIds.length; i++) {
      const typeId = requestedTypeIds[i];
      const componentsOfType = requestedComponentsByType[i];
      const type = types.find((i) => i.id === typeId);

      if (!type) {
        throw new NotFoundException(
          'Failed to find PizzaComponentType with id ' + typeId,
        );
      }
      if (type.maximum < componentsOfType.length) {
        throw new BadRequestException(
          `Cannot select more than ${type.maximum} components of type "${type.name}"`,
        );
      }
    }
  }

  async getOrder(id: number) {
    return await this.orderRepository.findOneBy({ id });
  }

  async listOrdersOfUser(
    user: User,
    filter: FindOptionsWhere<Order>,
    searchString: string,
    sortBy: string,
    descending: boolean,
  ) {
    return await this.listAllOrders(
      { ...filter, userId: user.id },
      searchString,
      sortBy,
      descending,
    );
  }

  async createOrder(user: User, order: OrderDto): Promise<Order> {
    if (!order.pizzas || !order.pizzas.length)
      throw new BadRequestException('Cannot make order without any pizzas');

    for (const pizza of order.pizzas)
      if (!pizza.components || !pizza.components.length)
        throw new BadRequestException(
          'Cannot make order with a pizza without any components',
        );

    const orderDoc = await this.parseOrder(user, order);

    for (const pizza of orderDoc.pizzas) {
      await this.validatePizza(pizza);
    }

    await this.orderRepository.insert(orderDoc);
    return orderDoc;
  }

  async updateOrderStatus(user: User, id: number, newStatus: OrderStatus) {
    return await this.updateOrder(user, id, { status: newStatus });
  }

  async updateOrder(user: User, id: number, order: Partial<OrderDto>) {
    const originalDoc = await this.getOrder(id);
    if (!originalDoc) throw new NotFoundException();
    if (!user.isAdmin) {
      if (user.id !== originalDoc.userId)
        throw new UnauthorizedException('Only Admin can edit orders of others');
    }

    const orderDoc = await this.parseOrder(user, {
      address: order.address || originalDoc.address,
      status: user.isAdmin
        ? order.status || originalDoc.status
        : originalDoc.status, // ignore status field id user is not Admin
      desiredDeliveryTime:
        order.desiredDeliveryTime || originalDoc.desiredDeliveryTime,
      pizzas: order.pizzas || [],
    });

    delete orderDoc.orderTimestamp; // to avoid changing the original timestamp

    if (!order.pizzas) delete orderDoc.pizzas; // to avoid deleting all pizzas
    else {
      for (const pizza of orderDoc.pizzas) await this.validatePizza(pizza);
    }

    await runInTransaction(this.dataSource, async () => {
      if (orderDoc.pizzas) {
        await this.orderedPizzaRepository.delete({ order: { id } });

        for (const pizzaDoc of orderDoc.pizzas) {
          pizzaDoc.orderId = id;
          await this.orderedPizzaRepository.insert(pizzaDoc);

          for (const componentDoc of pizzaDoc.components) {
            componentDoc.pizzaId = pizzaDoc.id;
            await this.orderedPizzaComponentRepository.insert(componentDoc);
          }
        }
      }

      delete orderDoc.pizzas; // pizzas are alreadt written - no need to attempt to write them again
      await this.orderRepository.update({ id }, orderDoc);
    });
  }

  async listAllOrdersWithStatus(
    status: OrderStatus,
    filter: FindOptionsWhere<Order>,
    searchString: string,
    sortBy: string,
    descending: boolean,
  ) {
    return await this.listAllOrders(
      { ...filter, status },
      searchString,
      sortBy,
      descending,
    );
  }

  async listAllOrders(
    filter: FindOptionsWhere<Order>,
    search: string,
    sortBy: string,
    descending: boolean,
  ) {
    const whereFilter: FindOptionsWhere<Order> | FindOptionsWhere<Order>[] =
      search === undefined
        ? { ...filter }
        : [
            { address: Like(`%${search}%`), ...filter },
            { userEmail: Like(`%${search}%`), ...filter },
            { userPhone: Like(`%${search}%`), ...filter },
            { userFullName: Like(`%${search}%`), ...filter },
            { extraDeliveryInstructions: Like(`%${search}%`), ...filter },
          ];

    const results = await this.orderRepository.find({
      where: whereFilter,
      order:
        sortBy === undefined
          ? undefined
          : { [sortBy]: descending ? 'DESC' : 'ASC' },
    });
    return results;
  }

  async deleteOrder(id: number) {
    const originalDoc = await this.getOrder(id);
    if (!originalDoc) throw new NotFoundException();
    const pizzas = originalDoc.pizzas;
    const components = pizzas.flatMap((i) => i.components);

    for (const { id } of components) {
      await this.orderedPizzaComponentRepository.delete(id);
    }
    for (const { id } of pizzas) {
      await this.orderedPizzaRepository.delete(id);
    }
    await this.orderRepository.delete(originalDoc.id);
  }
}
