# my-first-NestJS-app

A demo NestJS app about a Pizzeria

## Api Routes:

- `[GET]        /health`

- `[POST]       /auth`
- `[DELETE]     /auth`

- `[GET]        /admin/profile`
- `[GET]        /admin/profile/:id`
- `[POST]       /admin/profile`
- `[PUT]        /admin/profile/:id`
- `[DELETE]     /admin/profile/:id`

- `[POST]       /admin/pizza-components`
- `[PUT]        /admin/pizza-components/:id`

- `[GET]        /admin/order`
- `[POST]       /admin/order`
- `[PUT]        /admin/order/:id`
- `[DELETE]     /admin/order/:id`

- `[GET]        /profile`
- `[PUT]        /profile`

- `[GET]        /pizza-components`
- `[GET]        /pizza-components/:type`

- `[GET]        /order`
- `[POST]       /order`
- `[PUT]        /order/:id`

## Important Comments:

- [The ENV Singleton Problem](src/env.ts)
- [The Hard-LogOut feature](src/users/user.entity.ts)
