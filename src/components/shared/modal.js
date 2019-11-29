import React, { Component, Fragment } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class ModalComponent extends Component {
  render() {
    return (
      <Fragment>
        <Modal isOpen={true} size="lg">
          <ModalHeader>{this.props.header}</ModalHeader>
          <ModalBody
            style={{
              maxHeight: 400,
              overflow: "auto"
            }}
          >
            {this.props.body}
          </ModalBody>
          <ModalFooter>
            <div onClick={() => this.props.close()}>{this.props.footer}</div>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default ModalComponent;
