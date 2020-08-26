import React, { useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

/**
 * This component is a CardDeck wrapper which inserts
 * each subsection's header and body into a Card.
 * The header strings are expected to contain HTML tags
 * set from the code, so it's safe to interpret them as HTML.
 */  
function InputSection(props) {
  return (
    <CardDeck className="mb-5">
      {
        props.subsections.map((subsection, i) =>
          <Card key={i}>
            <Card.Header>
              <div className="lead" dangerouslySetInnerHTML={subsection.header}/>
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

/**
 * This form passes the contents of the user-uploaded file
 * to the processFileAsync callback.
 */
function FileInputForm(props) {
  const fileInputRef = React.createRef();
  const handleSubmit = async () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      await props.processFileAsync(file);
    }
  };

  return (
    <Form>
      <Form.File ref={fileInputRef} id="fileForm" />
      <LoadingButton onClickAsync={handleSubmit}>Submit</LoadingButton>
    </Form>
  );
}

/**
 * This button sets itself to a "loading" state when clicked
 * and exists this state once onClickAsync runs to completion.
 */
function LoadingButton(props) {
  const [isLoading, setLoading] = React.useState(false);
  const handleClick = () => setLoading(true);
  const onClickCallback = props.onClickAsync;

  useEffect(() => {
    if (isLoading) {
      onClickCallback().then(() => setLoading(false));
    }
  }, [isLoading, onClickCallback]);

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

export {
  InputSection,
  FileInputForm,
  LoadingButton
};