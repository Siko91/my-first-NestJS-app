# my-first-NestJS-app

A demo NestJS app about a Pizzeria

## Controllers:

- `/docs` for Swagger documentation
- `/health` for checking the state of the server
- `/auth` for login, register, getProfile, logout
- `/users/self` for getting or updating one's own profile
- `/users/admin` for administrating users (list, getOne, add, update, delete)
- `/pizza-components` for getting information about the possible pizza parts on the menu
- `/pizza-components/admin` for administrating the possible pizza parts on the menu
- `/order` for listing, creating and updating pizza orders
- `/order/admin` for administrating orders (list, filteredList, create, update, delete)

## Important Comments:

- [The ENV Singleton Problem](src/env.ts)
- [The Hard-LogOut feature](src/users/user.entity.ts)
- [The "PickWithout" TS Type](src/utils/typescript.ts)

## My Personal Experience:

NestJS has an interesting and vary different way of doing things. I'm still getting used to it.

**The things I like:**

- Unit tests are fast enough to run on each file modification
- API documentation is generated from actual code (instead of from comments or OpenAPI files)

**Things that I also like, but I am still getting used to:**

- The folder structure is very different from what I'm used to seeing.
- The unit tests being scattered around the code, instead of grouped in 1 place.
- The way NestJS does dependency injections.

**Things I do not like so much:**

- The way Middleware functionality works in NestJS is easy to attach, but also easy to forget.
  - This is not a huge issue, but it is something that one needs to keep in mind.
  - The simplest way to avoid problems is to add a few extra tests dedicated to checking if each Controller has the right middleware.
- It is cool that tests can specify the dependency injections with whatever Mocks they choose to use, but it is a bit annoying that it always has to be so explicit.
  - In my case I don't even need mocks.
  - Because I didn't want to bother with that part, I wrapped it behind the `getControllerOrService(Module, ControllerOrService)` function
