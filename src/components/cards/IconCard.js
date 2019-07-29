import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import IntlMessages from "../../helpers/IntlMessages";

const IconCard = ({ className = "mb-4", icon, title, value }) => {
  return (
    <div className={`icon-row-item ${className}`}>
      <Card >
        <CardBody className="text-center">
          <Row>
            <Col xs="2"> <h1><i className={icon} /></h1> </Col>
          </Row>
          <Row>
            <Col xs="4"><h2 className="text-left">
              <IntlMessages id={title} />
            </h2>
            </Col>
            <Col><h1 className="text-right" style={{ fontSize: '-webkit-xxx-large ' }}>{value}</h1></Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default IconCard;