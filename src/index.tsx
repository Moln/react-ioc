import React, {
  ComponentProps,
  ComponentType,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  PureComponent,
  RefAttributes,
  useContext,
  Component,
} from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';

export interface ContainerInterface {
  get<T>(token: InjectionToken<T>): T;

  has(token: InjectionToken<any>): boolean;
}

export const DependencyContainerContext = React.createContext<ContainerInterface | null>(
  null
);

type Constructor<T> = new (...args: any[]) => T;

type InjectionToken<T = any> = Constructor<T> | string | symbol;

type WithOptional<T, K> = Omit<T, Extract<K, string>> & Partial<T>;

type IReactComponent<T, P = {}> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>;

type Dict = { [k in string]: any };

type PropsFactory<P, RP extends Dict> = (
  container: ContainerInterface,
  nextProps: P
) => RP;

export function injectServices<P = {}, RP extends Dict = Dict>(
  fn: PropsFactory<P, RP> | { [key in keyof RP]: InjectionToken<any> }
) {
  if (typeof fn === 'object') {
    const dict = fn;
    fn = (container: ContainerInterface, props: Dict) => {
      const newProps: Dict = {};
      Object.keys(dict).forEach(key => {
        newProps[key] = (props && props[key]) || container.get(dict[key]);
      });

      return newProps as RP;
    };
  }

  return <
    T extends ComponentType<any>,
    WOP = WithOptional<ComponentProps<T>, keyof RP>
  >( //WOP = WithOptional<ComponentProps<T>, keyof RP>
    component: T
  ): IReactComponent<T, WOP> => {
    let Injector = React.forwardRef<T, WOP>((props, ref) => {
      const newProps: any = { ...props };
      const container = useContext(DependencyContainerContext)!;

      if (process.env.NODE_ENV !== 'production') {
        if (!container) {
          containerNotFound();
        }
      }

      if (ref) {
        newProps.ref = ref;
      }

      Object.assign(
        newProps,
        (fn as PropsFactory<ComponentProps<T>, RP>)(container, newProps)
      );

      return React.createElement(component, newProps);
    });

    if (process.env.NODE_ENV !== 'production') {
      Injector.displayName =
        'inject(' +
        (component.displayName || component.name || 'Component') +
        ')';
    }

    hoistNonReactStatic(Injector, component);

    return Injector;
  };
}

export class DependencyContainerProvider extends PureComponent<{
  container: ContainerInterface;
}> {
  render() {
    const { children, container } = this.props;
    return (
      <DependencyContainerContext.Provider value={container}>
        {children}
      </DependencyContainerContext.Provider>
    );
  }
}

export function useService<T>(token: InjectionToken<T>) {
  const container = useContext(DependencyContainerContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!container) {
      containerNotFound();
    }
  }

  return container!.get(token);
}

function containerNotFound() {
  throw new Error('Container not found.');
}

export function inject(token?: InjectionToken) {
  return (target: Component, propertyKey: string | symbol) => {
    (target.constructor as any).contextType = DependencyContainerContext;

    const descriptor = {
      configurable: true,
      enumerable: true,
      get() {
        const resolvedToken =
          token || Reflect.getMetadata('design:type', target, propertyKey);
        const instance = (this as any).context.get(resolvedToken);
        Object.defineProperty(this, propertyKey, {
          enumerable: true,
          writable: true,
          value: instance,
        });
        return instance;
      },
    };
    Object.defineProperty(target, propertyKey, descriptor);

    return descriptor as any;
  };
}
