import React, { Component, Fragment } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class ModalComponent extends Component {
    render() {
      return (
        <Fragment>
          <Modal
            isOpen={true}
          >
            <ModalHeader>{this.props.header}</ModalHeader>
            <ModalBody>{this.props.body}</ModalBody>
            <ModalFooter><div onClick={() => this.props.close()}>{this.props.footer}</div></ModalFooter>
          </Modal>
        </Fragment>
      )
    }
}

export default ModalComponent;