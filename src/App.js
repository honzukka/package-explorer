import React from 'react';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

import Data from './data';
import { getMockData, getFileData } from './data';
import { useAccordionToggle } from 'react-bootstrap';

// TODO: the Accordion element definition is scattered across multiple functions...
//    - same thing with the card deck...
// TODO: would loading the body data only on click make things faster? (callback?)
//    - https://reactjs.org/docs/optimizing-performance.html#virtualize-long-lists
// TODO: add comments :-)
// TODO: speed it up a bit and maybe include some loading animation while the user is waiting

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      packages: new Data().packages,
      // packages: new Map()
    };

    this.setMockData = this.setMockData.bind(this);
    this.setFileData = this.setFileData.bind(this);
  }

  setMockData() {
    getMockData().then((data) => this.setState({packages: data}));
  }

  setFileData(file) {
    getFileData(file).then((data) => this.setState({packages: data}));
  }

  render() {
    return (
      <Container fluid className="p-3">
        <PageHeading />

        <CardDeck className="mb-5">
          <FileInput callback={this.setFileData} />
          <MockInput callback={this.setMockData} />
        </CardDeck>

        <Accordion>
          <List packages={this.state.packages}/>
        </Accordion>
      </Container>
    );
  }
}

function PageHeading(props) {
  return <h1 className="mb-5">Welcome to Package Explorer!</h1>;
}

function MockInput(props) {
  return (
    <Card>
      <Card.Body>
        <Button onClick={props.callback}>Show mock input</Button>
      </Card.Body>
    </Card>
  );
}

// TODO: could this be made into a function?
class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.callback = props.callback;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  handleSubmit(event) {
    event.preventDefault();
    const file = this.fileInput.current.files[0];
    if (file) {
      this.callback(file);
    }
  }

  render() {
    return (
      <Card>
        <Card.Body>
          <Form onSubmit={this.handleSubmit}>
            <Form.File ref={this.fileInput} id="fileForm" label="Upload your file!" />
            <Button type="submit">Submit</Button>
          </Form>
        </Card.Body>
      </Card>
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
          {/* <PackageReverseDependencies deps={props.data.reverseDependencies} /> */}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}

function PackageTitle(props) {
  return <h2 className="mb-3">{props.name}</h2>;
}

function PackageDescription(props) {
  return (
    <p className="mb-3" style={{ whiteSpace: `pre-wrap` }}>
      {props.description.split("\n").map((line, i) => <span key={i}>{line}<br/></span>)}
    </p>
  );
}

function PackageDependencies(props) {
  return (
    <>
      <p><b>Dependencies: </b></p>
      <DependencyList deps={props.deps}></DependencyList>
    </>
  );
}

function PackageReverseDependencies(props) {
  return (
    <>
      <p><b>Reverse dependencies: </b></p>
      <DependencyList deps={props.deps}></DependencyList>
    </>
  );
}

function DependencyList(props) {
  return props.deps.map((depAlts, i) => (
    <ButtonGroup key={i} className="mx-2">
      <PackageLinkDependencyAlts depAlts={depAlts}/>
    </ButtonGroup>
  ));
}

function PackageLinkHeader(props) {
  return (
      <Accordion.Toggle as={Button} variant="link" eventKey={props.name}>
        {props.name}
      </Accordion.Toggle>
  );
}

function PackageLinkDependencyAlts(props) {
  return props.depAlts.map(dep => <PackageLinkDependency key={dep.name} dep={dep} />)
}

// TODO: scroll to the package when a dependency link is clicked!
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
      <Button variant="light" className={buttonClass}>
        {props.dep.name}
      </Button>
    )
  }
}

export default App;