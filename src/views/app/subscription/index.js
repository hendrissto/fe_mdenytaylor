import React, { Component, Fragment } from "react";
import { Card, CardBody, } from "reactstrap";
import ReactTable from "react-table";

import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import DataTablePagination from "../../../components/DatatablePagination";
import { InputGroup, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
// import { InputGroup, Button, InputGroupButtonDropdown, Input, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import SubscriptionRestService from "../../../core/subscriptionRestService";

export default class Subscription extends Component {
  constructor(props) {
    super(props);
    this.subscriptionRest =  new SubscriptionRestService();
    this.handleInputChange = this.handleInputChange.bind(this);

    this.toggle = this.toggle.bind(this);
    this.state = {
      data: [],
      table: {
        loading: true,
        data: [],
        pagination: {
          currentPage: null,
          totalPages: 0,
          skipSize: 0,
          pageSize: 10
        }
      },

      dropdownOpen: false,
      modal: false,
      oneData: "",
      search: ""
    };
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleOnPageChange(skipSize) {
    const table = {...this.state.table}
    table.loading = true;
    table.pagination.skipSize = (skipSize * table.pagination.pageSize)

    this.setState({table});
    this.loadData();
  }

  handleOnPageSizeChange(newPageSize, newPage) {
    const table = {...this.state.table}
    table.loading = true;
    table.pagination.pageSize = newPageSize
    this.setState({table});
    this.loadData();
  }

  handleSortedChange(newSorted, column, additive) {
    console.log(newSorted)
    console.log(column)
    console.log(additive)
  }

  loadData() {
    const table = {...this.state.table}
    table.loading = true;
    this.setState({table});

    const params = {
      keyword: this.state.search || null,
      "options.take": this.state.table.pagination.pageSize,
      "options.skip": this.state.table.pagination.skipSize,
      // "options.sort": this.state.table.pagination.pageSize,
      // "options.filter": this.state.table.pagination.pageSize,
      // lowJoinDate: "",
      // highJoinDate: "",
      // lowLastLoginDate: "",
      // highLastLoginDate: "",
      // includeTotalCount: false
    }

    
    this.subscriptionRest.getTenants({params}).subscribe((response) => {
      const table = {...this.state.table}
      // console.log(table)
      table.data = response.data;
      table.loading = false;
      // console.log({table}))
      this.setState({table});
      // console.log(this.state)
    })
  }

  componentDidMount() {
    this.loadData();
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }


  dataTable() {
    return (
      [
        {
          Header: "ID",
          accessor: "id",
          Cell: props =>
            <Button color="link" className="text-primary" onClick={() => {
              this.toggle();
              this.setState({ oneData: props.original });
            }}>
              <p>{props.value}</p>
            </Button>
        },
        {
          Header: "Owner",
          accessor: "owner.fullName",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Email",
          accessor: "email",
          Cell: props => <p>{props.value}</p>
        },
        {
          Header: "Phone",
          accessor: "phone",
          Cell: props => <p>{props.value}</p>
        },
      ]
    )
  }
  oneData() {
    return (
      <div>
        <Row>
          <Col xs="3"> No. Receipt </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.receiptNumber} </Col>
        </Row>
        <Row>
          <Col xs="3"> Sender </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.sender} </Col>
        </Row>
        <Row>
          <Col xs="3"> Receiver </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.receiver} </Col>
        </Row>
        <Row>
          <Col xs="3"> Total </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.amount} </Col>
        </Row>
        <Row>
          <Col xs="3"> Status </Col>
          <Col xs="1">:</Col>
          <Col> {this.state.oneData.status} </Col>
        </Row>
      </div>
    )
  }
  render() {

    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="menu.subscription" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Card className="mb-12 lg-12">
              <CardBody>
                <div className="row">
                  <div className="mb-3 col-md-5">
                  <InputGroup>
                    {/* <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen} toggle={this.toggleSplit}>
                      <DropdownToggle color="primary" className="default">
                        <i className="simple-icon-menu" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>1</DropdownItem>
                        <DropdownItem>2</DropdownItem>
                      </DropdownMenu>
                    </InputGroupButtonDropdown> */}
                    <Input placeholder="Search Owner" name="search" value={this.state.search} onChange={this.handleInputChange} 
                      onKeyPress={event => {
                        if (event.key === 'Enter') {
                          this.loadData();
                        }
                      }}/>
                    <Button className="default"  color="primary" onClick={() => this.loadData()}>
                      <i className="simple-icon-magnifier" />
                    </Button>
                    {/* <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen1} toggle={this.toggleSplit1}>
                      <DropdownToggle color="primary" className="default">
                        <span className="mr-2">Filter</span> <i className="iconsminds-arrow-down-2" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>1</DropdownItem>
                        <DropdownItem>2</DropdownItem>
                      </DropdownMenu>
                    </InputGroupButtonDropdown> */}
                  </InputGroup>
                </div>
              </div>

                <ReactTable
                  className="-striped"
                  data={this.state.table.data}
                  columns={this.dataTable()}
                  onSortedChange={this.handleSortedChange}
                  minRows={2}
                  loading={this.state.table.loading}
                  // pageSize={100}
                  // page={1}
                  pages={5}
                  defaultPageSize={this.state.table.pagination.pageSize}
                  onPageChange={(skipSize) => this.handleOnPageChange(skipSize)}
                  onPageSizeChange={(newPageSize, newPage) => this.handleOnPageSizeChange(newPageSize, newPage)}
                  showPageJump={false}
                  PaginationComponent={DataTablePagination}
                  showPageSizeOptions={true}
                  noDataText={"Data not yet available"}
                />
              </CardBody>
            </Card>
          </Colxx>
        </Row>

        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Detail Resi COD</ModalHeader>
          <ModalBody>
            {this.oneData()}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" outline onClick={this.toggle}>Close</Button>
          </ModalFooter>
        </Modal>
      </Fragment>
    )
  }
}