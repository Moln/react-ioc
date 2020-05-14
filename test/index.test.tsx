import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  DependencyContainerProvider,
  inject,
  injectServices,
  useService,
} from '../src';
import { Component, createRef, ReactElement } from 'react';
import DependencyContainer from '@moln/dependency-container';

class Foo {}
class Bar {}

const container = new DependencyContainer();
container.registerSingleton(Foo);
container.registerSingleton(Bar);

function render(component: ReactElement) {
  const div = document.createElement('div');
  ReactDOM.render(
    <React.StrictMode>
      <DependencyContainerProvider container={container}>
        {component}
      </DependencyContainerProvider>
    </React.StrictMode>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
}

type BazProps = { foo: Foo; bar: Bar };

describe('it', () => {
  it('inject services for class component', () => {
    class BazComponent extends Component<BazProps> {
      render() {
        const { foo, bar } = this.props;
        expect(foo).toBe(container.get(Foo));
        expect(bar).toBe(container.get(Bar));

        return <div>baz</div>;
      }
    }

    const injector = injectServices({
      foo: Foo,
      bar: Bar,
    });
    const WrappedBazComponent = injector(BazComponent);

    render(<WrappedBazComponent ref={createRef()} />);

    const injector2 = injectServices<BazProps>((c, props) => {
      expect(props.foo).toBe('abc');

      return {
        foo: c.get(Foo),
        bar: c.get(Bar),
      };
    });
    const WrappedBazComponent2 = injector2(BazComponent);

    render(<WrappedBazComponent2 foo={'abc'} />);
  });

  it('inject services for function component', () => {
    const BazComponent = ({ foo, bar }: BazProps) => {
      expect(foo).toBe(container.get(Foo));
      expect(bar).toBe(container.get(Bar));

      return <div>baz</div>;
    };

    const injector = injectServices({
      foo: Foo,
      bar: Bar,
    });
    const WrappedBazComponent = injector(BazComponent);

    render(<WrappedBazComponent />);
  });

  it('using useService for function component', () => {
    const BazComponent = () => {
      const foo = useService(Foo);
      const bar = useService(Bar);
      expect(foo).toBe(container.get(Foo));
      expect(bar).toBe(container.get(Bar));

      return <div>baz</div>;
    };

    render(<BazComponent />);
  });

  it('should inject properties', function() {
    class BazComponent extends Component {
      @inject() private foo!: Foo;
      render() {
        expect(this.foo).toBe(container.get(Foo));

        return <div>baz</div>;
      }
    }
    render(<BazComponent />);
  });
});
