import React, { Component, Fragment } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class ModalComponent extends Component {
  render() {
    return (
      <Fragment>
        <Modal isOpen={true} size={this.props.modalSize || 'lg'}>
          {this.props.toggle &&
          (
            <ModalHeader toggle={() => this.props.close()}>{this.props.header}</ModalHeader>
          )}
          {!this.props.toggle &&
          (
            <ModalHeader>{this.props.header}</ModalHeader>
          )}
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
            {this.props.isSubmit && (
              <div onClick={() => this.props.onSubmit()}>
                {this.props.buttonSubmit}
              </div>
            )}
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default ModalComponent;
