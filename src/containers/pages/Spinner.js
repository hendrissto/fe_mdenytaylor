import React from "react";
import Loader from "react-loader-spinner";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    border: '0px',
  }
};

const Loading = props => (
  <Modal isOpen={true} style={customStyles}>
    <Loader type="Oval" color="#51BEEA" height={80} width={80} />
  </Modal>
);

export default Loading;
