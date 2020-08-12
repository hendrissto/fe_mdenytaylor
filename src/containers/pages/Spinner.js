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
  <Modal isOpen={true} style={customStyles} ariaHideApp={false}>
    <div class="loader-cstm" style={{ width: "80px", height: "80px", border: "6px solid #f3f3f3", borderTop: "6px solid #3498db"}}></div>
    {/* <Loader type="Oval" color="#51BEEA" height={80} width={80}/> */}
  </Modal>
);

export default Loading;
