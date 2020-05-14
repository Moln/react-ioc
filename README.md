# React IoC helper

[![Build Status](https://travis-ci.org/Moln/react-ioc.svg?branch=master)](https://travis-ci.org/Moln/react-ioc) 
[![Coverage Status](https://coveralls.io/repos/github/Moln/react-ioc/badge.svg?branch=master)](https://coveralls.io/github/Moln/react-ioc?branch=master)
[![GitHub license](https://img.shields.io/github/license/Moln/react-ioc)](https://github.com/Moln/react-ioc)
[![npm](https://img.shields.io/npm/v/@Moln/react-ioc.svg)](https://www.npmjs.com/@Moln/react-ioc)

Use any ioc library (tsyringe, inversify, @Moln/react-ioc, etc.) in react.

- [Installation](#installation)
- [API](#api)
  - [DependencyContainerContext & DependencyContainerProvider](#dependencycontainercontext--dependencycontainerprovider)
    - [Use `@moln/dependency-container`](#use-molndependency-container)
    - [Use `tsyringe`](#use-tsyringe)
    - [Use `inversify`](#use-inversify)
  - [injectServices HOC](#injectservices-hoc)
  - [inject()](#inject)

## Installation

Install by `npm`

```sh
npm install --save @moln/react-ioc
```

**or** install with `yarn` (this project is developed using `yarn`)

```sh
yarn add @moln/react-ioc
```


## API

### DependencyContainerContext & DependencyContainerProvider

#### Use [`@moln/dependency-container`](https://www.npmjs.com/package/@moln/dependency-container) 

```typescript
class Foo { name = 'foo' }
class Bar { name = 'bar' }

const container = new DependencyContainer();
container.registerSingleton(Foo);
container.registerSingleton('MyBar', Bar);

render(
  <DependencyContainerProvider container={container}>
    <App />
  </DependencyContainerProvider>,
  document.createElement('app')
);
```

#### Use [`tsyringe`](https://www.npmjs.com/package/tsyringe)

```typescript
import {container, injectable} from "tsyringe";

// For implement `ContainerInterface`
container.get = container.resolve;

@injectable()
class Foo { name = 'foo' }

@injectable()
class Bar { name = 'bar' }

render(
  <DependencyContainerProvider container={container as ContainerInterface}>
    <App />
  </DependencyContainerProvider>,
  document.createElement('app')
);
```

#### Use [`inversify`](https://www.npmjs.com/package/inversify)


```typescript
import {Container, injectable} from "inversify";

const container = new Container();

@injectable()
class Foo { name = 'foo' }

@injectable()
class Bar { name = 'bar' }

render(
  <DependencyContainerProvider container={container as ContainerInterface}>
    <App />
  </DependencyContainerProvider>,
  document.createElement('app')
);
```

### injectServices HOC

```typescript
type BazProps = { foo: Foo; bar: Bar };

class BazComponent extends Component<BazProps> {
  render() {
    const {foo, bar} = this.props;
    return <div>hello {foo.name}! {bar.name}! </div>;
  }
}

const WrapperdBazComponent = injectServices({
  foo: Foo,
  bar: Bar,
})(BazComponent);

render(
  <DependencyContainerProvider container={container}>
    <WrapperdBazComponent />
  </DependencyContainerProvider>,
  document.createElement('app')
);
```

```typescript
// By custom factory
const WrapperdBazComponent = injectServices((container, props) => {
  return {
    foo: container.get(Foo),
    bar: porps.bar || container.get(Bar),
  }
})(BazComponent);

render(
  <DependencyContainerProvider container={container}>
    <WrapperdBazComponent bar={new Bar} />
  </DependencyContainerProvider>,
  document.createElement('app')
);
```

### useService

```typescript
const BazComponent = () => {
  const foo = useService(Foo);
  const bar = useService(Bar);

  return <div>{foo.name} {bar.name}</div>;
};

render(
  <DependencyContainerProvider container={container}>
    <BazComponent />
  </DependencyContainerProvider>,
  document.createElement('app')
);
```

### inject()

Modify your `tsconfig.json` to include the following settings

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Add a polyfill for the Reflect API (examples below use reflect-metadata). You can use:

- [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
- [core-js (core-js/es7/reflect)](https://www.npmjs.com/package/core-js)
- [reflection](https://www.npmjs.com/package/@abraham/reflection)

The Reflect polyfill import should only be added once, and before DI is used:

```typescript
// main.ts
import "reflect-metadata";

// Your code here...
```

#### Component usage:

```typescript
class Foo { name = 'foo' }
class Bar { name = 'bar' }

// Use @moln/dependency-container demo 
const container = new DependencyContainer();
container.registerSingleton(Foo);
container.registerSingleton('MyBar', Bar);

class BazComponent extends Component {
  @inject() private foo!: Foo;
  @inject('MyBar') private bar!: Bar;
  render() {
    return <div>hello {this.foo.name}! {this.bar.name}! </div>;
  }
}
```
