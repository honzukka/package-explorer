import React from 'react';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import Data from './data';

// TODO: the Accordion element definition is scattered across multiple functions...
// TODO: would loading the body data only on click make things faster? (callback?)
//    - https://reactjs.org/docs/optimizing-performance.html#virtualize-long-lists

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
        <Accordion>
          <List packages={this.state.packages}/>
        </Accordion>
      </Container>
    );
  }
}

function List(props) {
  let items = [];
  for (let [packageName, packageData] of props.packages) {
    items.push(
      <Item key={packageName}
        name={packageName}
        data={packageData}
      />
    );
  }
  return items;
}

function Item(props) {
  return (
    <Card>
      <Card.Header>
        <PackageLinkHeader name={props.name} />
      </Card.Header>
      <Accordion.Collapse eventKey={props.name}>
        <Card.Body>
          <PackageTitle name={props.name} />
          <PackageDescription description={props.data.description} />
          <PackageDependencies deps={props.data.dependencies} />
          <PackageReverseDependencies deps={props.data.reverseDependencies} />
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}

function PackageTitle(props) {
  return <h1 className="mb-3">{props.name}</h1>;
}

function PackageDescription(props) {
  return <p className="mb-3">{props.description}</p>;
}

function PackageDependencies(props) {
  return (
    <>
      <p><b>Dependencies: </b></p>
      <p><DependencyList deps={props.deps}></DependencyList></p>
    </>
  );
}

function PackageReverseDependencies(props) {
  return (
    <>
      <p><b>Reverse dependencies: </b></p>
      <p><DependencyList deps={props.deps}></DependencyList></p>
    </>
  );
}

function DependencyList(props) {
  return props.deps.map(dep => <PackageLinkDependency key={dep.name} dep={dep}/>);
}

function PackageLinkHeader(props) {
  return (
      <Accordion.Toggle as={Button} variant="link" eventKey={props.name}>
        {props.name}
      </Accordion.Toggle>
  );
}

function PackageLinkDependency(props) {
  const buttonClass = "mr-1 mt-1";
  if (props.dep.listed) {
    return (
      <Accordion.Toggle as={Button} variant="secondary" className={buttonClass} eventKey={props.dep.name}>
        {props.dep.name}
      </Accordion.Toggle>
    );
  } else {
    return (
      <Button key={props.dep.name} variant="light" className={buttonClass}>
        {props.dep.name}
      </Button>
    )
  }
}

export default App;