import React, { Component, Fragment } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import ReactTable from "react-table";
import { Row } from "reactstrap";

import IntlMessages from "../../../helpers/IntlMessages";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { data } from "./expenditure-data-table";


export default class expenditureListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }
  render() {
    const totalBalance = 'Rp 580.000.000';
    const dataTableColumns = [
      {
        Header: "Tanggal Pengiriman",
        accessor: "dateSender",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Seller",
        accessor: "seller",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Jumlah Saldo dikirim",
        accessor: "ballanceAmountSent",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Dikirim ke rekening",
        accessor: "sentToAccount",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: props => <p>{props.value}</p>
      },
      {
        Header: "Bukti",
        accessor: "proof",
        Cell: () => {
          return (
            <div>
              <Button outline color="info" onClick={this.toggle}>
                <i className="simple-icon-paper-clip mr-2" />Bukti transfer
              </Button>
            </div>
          )
        }
      }
    ];
    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="expenditure.title" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Card className="mb-12 lg-12">
              <CardBody>
                <CardTitle>
                  <h3><IntlMessages id="title.total-balance" /></h3>
                  <h1>{totalBalance}</h1>
                </CardTitle>
                <ReactTable
                  className="-striped -highlight"
                  data={data}
                  columns={dataTableColumns}
                  minRows={0}
                  defaultPageSize={5}
                  filterable={true}
                  showPageJump={true}
                  PaginationComponent={DataTablePagination}
                  showPageSizeOptions={true}
                />
              </CardBody>
            </Card>
          </Colxx>
        </Row>

        {/* modal-bukti-transfer */}
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Bukti Transfer</ModalHeader>
          <ModalBody>
            
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '}
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>

      </Fragment>
    )
  }
}
