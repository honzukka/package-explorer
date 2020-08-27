import React, { useEffect } from 'react';
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
 * When props.info is set, this component proceeds to show a modal window
 * containing package information.
 */
function PackageInformation(props) {
  const info = props.info;
  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);

  useEffect(() => { if (info) setShow(true); }, [info]);

  return (
    <Modal show={show} onHide={handleClose} size='lg'>
      <Modal.Header closeButton>
        <PackageTitle name={info?.name} />
      </Modal.Header>
      <Modal.Body>
        <PackageDescription description={info?.description} />
        <Dependencies header="Dependencies:" deps={info?.dependencies} />
        <Dependencies header="Reverse dependencies:" deps={info?.reverseDependencies} />
      </Modal.Body>
    </Modal>
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
        props.deps.map((depGroup, i) => 
          <ButtonGroup key={i} className="mx-3">
            {
              depGroup.map((dep) => dep.installed ?
                <InstalledButton key={dep.name} onClick={dep.showPackageInfo}>{dep.name}</InstalledButton> :
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
 * This button's onClick is meant to show information
 * about the installed dependency.
 */
function InstalledButton(props) {
  return (
    <Button variant="secondary" className="mr-1 mt-1" onClick={props.onClick}>
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
  //Item,
  PackageInformation
};