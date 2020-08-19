import React from 'react';
import Data from './data';

import Container from 'react-bootstrap/Container';



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      packages: new Data().packages,
    };
  }

  render() {
    return (
      <Container fluid className="p-3">
        <List packages={this.state.packages}/>
      </Container>
    );
  }
}

// FIXME: package info should unfold on click
class List extends React.Component {
  render() {
    let items = [];
    for (let [packageName, packageData] of this.props.packages) {
      items.push(
        <ul key={packageName}>
          <Item
            name={packageName}
            description={packageData.description}
            dependencies={packageData.dependencies}
            reverseDependencies={packageData.reverseDependencies}
          />
        </ul>
      );
    }
    return items;
  }
}

// FIXME: only dependencies that are installed should be clickable ('|' character...)
function Item(props) {
  return (
    <li>
      <h1 id={props.name}>{props.name}</h1>
      <p>{props.description}</p>
      <p><b>Dependencies: </b>{props.dependencies.map((dep) => <a key={props.name+dep} href={"#"+dep}>{dep}, </a>)}</p>
      <p><b>Reverse dependencies: </b>{props.reverseDependencies.map((dep) => <a key={props.name+dep} href={"#"+dep}>{dep}, </a>)}</p>
    </li>
  );
}

export default App;