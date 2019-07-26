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
        Header: "Tanggal Pengirim",
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
            <Breadcrumb heading="menu.expenditure" match={this.props.match} />
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
                  className="text-center"
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
          <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
          <ModalBody>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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
