import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import './App.css';
import { getMockData, getFileData } from './data';

// TODO: add comments
// TODO: refactor properly

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      packages: new Map()
    };

    this.packageItems = new Map();

    this.setMockData = this.setMockData.bind(this);
    this.setFileData = this.setFileData.bind(this);
    this.registerItem = this.registerItem.bind(this);
    this.switchAttention = this.switchAttention.bind(this);
  }

  async setMockData() {
    let data = await getMockData();
    this.setData(data);
  }

  async setFileData(file) {
    let data = await getFileData(file);
    this.setData(data);
  }

  setData(data) {
    for (let [packageName, packageData] of data) {
      packageData.dependencies = packageData.dependencies.map((depGroup) => depGroup.map((dep) => ({
        name: dep.name,
        listed: dep.listed,
        callback: () => this.switchAttention.bind(this)(packageName, dep.name)
      })));
      packageData.reverseDependencies = packageData.reverseDependencies.map((depGroup) => depGroup.map((dep) => ({
        name: dep.name,
        listed: dep.listed,
        callback: () => this.switchAttention.bind(this)(packageName, dep.name)
      })));
      data.set(packageName, packageData);
    }
    this.setState({ packages: data });
  }

  registerItem(packageName, itemRef, showCallback, closeCallback) {
    this.packageItems.set(packageName, {
      itemRef: itemRef,
      show: showCallback,
      close: closeCallback
    });
  }

  switchAttention(prevPackageName, nextPackageName) {
    if (prevPackageName) {
      this.packageItems.get(prevPackageName).close();
    }
    this.packageItems.get(nextPackageName).show();
    this.packageItems.get(nextPackageName).itemRef.current.focus();
  }

  render() {
    return (
      <Container fluid className="p-3">
        <PageHeading>Package Explorer</PageHeading>

        <InputSection subsections={[
            {
              header: {__html: "If you want to upload your own <code>/var/lib/dpkg/status</code>:"},
              body: <FileInputForm callback={this.setFileData} />
            },
            {
              header: {__html: "If you don't have <code>/var/lib/dpkg/status</code> handy:"},
              body: <LoadingButton callback={this.setMockData}>Submit mock file</LoadingButton>
            }
          ]}
        />

        <PackageList header={{__html: "Here is what the <code>/var/lib/dpkg/status</code> has revealed:"}}>
          {
            Array.from(this.state.packages).map(([packageName, packageData]) => 
              <Item key={packageName}
                name={packageName}
                data={packageData}
                registerCallback={this.registerItem}
              />
            )
          }
        </PackageList>
      </Container>
    );
  }
}

function PageHeading(props) {
  return <h1 className="display-3 mb-5">{props.children}</h1>;
}

function InputSection(props) {
  return (
    <CardDeck className="mb-5">
      {
        props.subsections.map((subsection, i) =>
          <Card key={i}>
            <Card.Header>
              <div className="lead" dangerouslySetInnerHTML={subsection.header}></div>
            </Card.Header>
            <Card.Body>
              {subsection.body}
            </Card.Body>
          </Card>
        )
      }
    </CardDeck>
  );
}

function FileInputForm(props) {
  const fileInputRef = React.createRef();
  const handleSubmit = async () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      await props.callback(file);
    }
  };

  return (
    <Form>
      <Form.File ref={fileInputRef} id="fileForm" />
      <LoadingButton callback={handleSubmit}>Submit</LoadingButton>
    </Form>
  );
}

function LoadingButton(props) {
  const [isLoading, setLoading] = React.useState(false);
  const handleClick = () => setLoading(true);

  useEffect(() => {
    if (isLoading) {
      props.callback().then(() => setLoading(false));
    }
  }, [isLoading, props]);

  return (
    <Button
      className="mt-2"
      variant="dark"
      disabled={isLoading}
      onClick={!isLoading ? handleClick : null}
    >
      {isLoading ? "Loading..." : props.children}
    </Button>
  );
}

function PackageList(props) {
  if (props.children.length === 0) {
    return null;
  }

  return (
    <Card>
      <Card.Header>
        <div className="lead" dangerouslySetInnerHTML={props.header}></div>
      </Card.Header>
      <Card.Body>
        {props.children}
      </Card.Body>
    </Card>
  );
}

function Item(props) {
  let itemRef = React.createRef();

  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShown = () => itemRef.current.scrollIntoView();

  props.registerCallback(props.name, itemRef, handleShow, handleClose);

  return (
    <>
      <Button ref={itemRef} className="m-2" variant="outline-secondary" onClick={handleShow}>{props.name}</Button>

      <Modal show={show} onHide={handleClose} onEntered={handleShown} size='lg'>
        <Modal.Header closeButton>
          <PackageTitle name={props.name} />
        </Modal.Header>
        <Modal.Body>
          <PackageDescription description={props.data.description} />
          <Dependencies text="Dependencies:" dependencies={props.data.dependencies} />
          <Dependencies text="Reverse dependencies:" dependencies={props.data.reverseDependencies} />
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

function Dependencies(props) {
  return (
    <>
      <p className="mt-3"><b>{props.text}</b></p>
      {
        props.dependencies.map((depGroup, i) => 
          <DependencyGroup key={i}>
            {
              depGroup.map((dep) => dep.listed ?
                <InstalledButton key={dep.name} handleClick={dep.callback}>{dep.name}</InstalledButton> :
                <MissingButton key={dep.name}>{dep.name}</MissingButton>
              )
            }
          </DependencyGroup>
        )
      }
    </>
  );
}

function DependencyGroup(props) {
  return (
    <ButtonGroup className="mx-3">
      {props.children}
    </ButtonGroup>
  );
}

function InstalledButton(props) {
  return (
    <Button variant="secondary" className="mr-1 mt-1" onClick={props.handleClick}>
      {props.children}
    </Button>
  );
}

function MissingButton(props) {
  return (
    <Button variant="outline-secondary" className="mr-1 mt-1">
      {props.children}
    </Button>
  );
}

export default App;