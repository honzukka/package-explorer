import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal';


/**
 * This is a Card wrapper which inserts a header
 * and each element of the children prop into a Card.
 */
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

/**
 * This component receives single package data
 * and returns the link to package information and the information panel itself. 
 * It also passes two functions to the registerInfoToggle callback:
 * one which shows the information panel and one which hides it.
 */
function Item(props) {
  let itemRef = React.createRef();

  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    itemRef.current.focus();
  };
  const handleShown = () => itemRef.current.scrollIntoView();

  props.registerInfoToggle(props.name, handleShow, handleClose);

  return (
    <>
      <Button ref={itemRef} className="m-2" variant="outline-secondary" onClick={handleShow}>
        {props.name}
      </Button>

      <Modal show={show} onHide={handleClose} onEntered={handleShown} size='lg'>
        <Modal.Header closeButton>
          <PackageTitle name={props.name} />
        </Modal.Header>
        <Modal.Body>
          <PackageDescription description={props.data.description} />
          <Dependencies header="Dependencies:" dependencies={props.data.dependencies} />
          <Dependencies header="Reverse dependencies:" dependencies={props.data.reverseDependencies} />
        </Modal.Body>
      </Modal>
    </>
  );
}

function PackageTitle(props) {
  return <h2 className="mb-3">{props.name}</h2>;
}

/**
 * This component replaces every "\n" character in the input with a corresponding HTML tag
 * and inserts everything into a paragraph.
 */
function PackageDescription(props) {
  return (
    <p className="mb-3" style={{ whiteSpace: `pre-wrap` }}>
      {props.description.split("\n").map((line, i) => <span key={i}>{line}<br/></span>)}
    </p>
  );
}

/**
 * This component returns a list of ButtonGroups
 * where each group contains alternate dependencies.
 */
function Dependencies(props) {
  return (
    <>
      <p className="mt-3"><b>{props.header}</b></p>
      {
        props.dependencies.map((depGroup, i) => 
          <ButtonGroup key={i} className="mx-3">
            {
              depGroup.map((dep) => dep.installed ?
                <InstalledButton key={dep.name} handleClick={dep.toggleInfo}>{dep.name}</InstalledButton> :
                <MissingButton key={dep.name}>{dep.name}</MissingButton>
              )
            }
          </ButtonGroup>
        )
      }
    </>
  );
}

/**
 * This button uses a callback on the dependency
 * which was added to the data in a preprocessing step.
 * This callback switches the context from the current package
 * to the one which is clicked.
 */
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

export {
  PackageList,
  Item
};