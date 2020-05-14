import * as React from 'react';
import * as ReactDOM from 'react-dom';
import DependencyContainer, { createContainer } from "@moln/dependency-container";
import {inject} from "@moln/react-ioc";
import {Component} from "react";

class Foo { name = 'foo' }
class Bar { name = 'bar' }

// Use @moln/dependency-container demo
const container = createContainer();
container.registerSingleton(Foo);
container.registerSingleton('MyBar', Bar);

class BazComponent extends Component {
    @inject() private foo!: Foo;
    @inject('MyBar') private bar!: Bar;
    render() {
        return <div>hello {this.foo.name}! {this.bar.name}! </div>;
    }
}

ReactDOM.render(<BazComponent />, document.getElementById('root'));
