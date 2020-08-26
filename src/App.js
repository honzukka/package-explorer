import React from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import Data from './data';
import { getMockData, getFileData } from './data';

// TODO: the Accordion element definition is scattered across multiple functions...
//    - same thing with the card deck...
// TODO: would loading the body data only on click make things faster? (callback?)
//    - https://reactjs.org/docs/optimizing-performance.html#virtualize-long-lists
// TODO: add comments :-)
// TODO: include some loading animation while the user is waiting
// TODO: highlight package button whose modal is open (or was just closed)
// TODO: take a proper look at hooks :-)
// TODO: refactor properly

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      packages: new Data().packages,
      // packages: new Map()
    };

    this.packageItemRefs = new Map();

    this.setMockData = this.setMockData.bind(this);
    this.setFileData = this.setFileData.bind(this);
    this.setPackageItemRefs = this.setPackageItemRefs.bind(this);
    this.scrollToPackageItem = this.scrollToPackageItem.bind(this);
  }

  setMockData() {
    getMockData().then((data) => this.setState({packages: data}));
  }

  setFileData(file) {
    getFileData(file).then((data) => this.setState({packages: data}));
  }

  setPackageItemRefs(packageName, packageItemRef) {
    this.packageItemRefs.set(packageName, packageItemRef);
  }

  scrollToPackageItem(packageName) {
    this.packageItemRefs.get(packageName).current.click();
  }

  render() {
    return (
      <Container fluid className="p-3">
        <PageHeading />

        <CardDeck className="mb-5">
          <FileInput callback={this.setFileData} />
          <MockInput callback={this.setMockData} />
        </CardDeck>

        <Card>
          <Card.Body>
              <List packages={this.state.packages} scrollCallback={this.scrollToPackageItem} refCallback={this.setPackageItemRefs} />
          </Card.Body>
        </Card>
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
        refCallback={props.refCallback}
        scrollCallback={props.scrollCallback}
      />
    );
  }
  return items;
}

function Item(props) {
  let itemRef = React.createRef();
  props.refCallback(props.name, itemRef);

  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };
  const handleShown = () => itemRef.current.scrollIntoView();

  return (
    <>
      <Button ref={itemRef} className="m-2" onClick={handleShow}>{props.name}</Button>

      <Modal show={show} onHide={handleClose} onEntered={handleShown}>
        <Modal.Header closeButton>
          <PackageTitle name={props.name} />
        </Modal.Header>
        <Modal.Body>
          <PackageDescription description={props.data.description} />
          <PackageDependencies
            deps={props.data.dependencies}
            scrollCallback={props.scrollCallback}
            closeCallback={handleClose}
          />
          <PackageReverseDependencies
            deps={props.data.reverseDependencies}
            scrollCallback={props.scrollCallback}
            closeCallback={handleClose}
          />
        </Modal.Body>
      </Modal>
    </>
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
      <DependencyList deps={props.deps} scrollCallback={props.scrollCallback} closeCallback={props.closeCallback}></DependencyList>
    </>
  );
}

function PackageReverseDependencies(props) {
  return (
    <>
      <p><b>Reverse dependencies: </b></p>
      <DependencyList deps={props.deps} scrollCallback={props.scrollCallback} closeCallback={props.closeCallback}></DependencyList>
    </>
  );
}

function DependencyList(props) {
  return props.deps.map((depAlts, i) => (
    <ButtonGroup key={i} className="mx-2">
      <PackageLinkDependencyAlts depAlts={depAlts} scrollCallback={props.scrollCallback} closeCallback={props.closeCallback}/>
    </ButtonGroup>
  ));
}

function PackageLinkDependencyAlts(props) {
  return props.depAlts.map(dep => <PackageLinkDependency key={dep.name} dep={dep} scrollCallback={props.scrollCallback} closeCallback={props.closeCallback} />)
}

function PackageLinkDependency(props) {
  const buttonClass = "mr-1 mt-1";
  const onClickDecorated = () => {
    props.scrollCallback(props.dep.name);
    props.closeCallback();
  };
  if (props.dep.listed) {
    return (
      <Button variant="secondary" className={buttonClass} onClick={onClickDecorated}>
        {props.dep.name}
      </Button>
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