import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import IntlMessages from "../../helpers/IntlMessages";

const IconCard = ({ className = "mb-4", icon, title, value }) => {
  return (
    <div className={`icon-row-item ${className}`}>
      <Card className="bg-primary text-white" style={{"background":"linear-gradient(90deg, rgba(24,67,143,1) 32%, rgba(31,102,175,1) 61%)"}}>
        <CardBody className="text-center">
          {icon && (
            <Row>
              <Col xs="2"> <h1 style={{ fontSize: '-webkit-xxx-large ' }}><i className={icon} /></h1> </Col>
            </Row>
          )}
          <Row>
            <Col xs="6"><h6 className="text-left" style={{wordBreak: 'keep-all'}}>
              <span style={{
                marginBottom: 30
              }}><IntlMessages id={title} /></span>
            </h6>
            </Col>
            <Col><h1 className="text-right" >{value}</h1></Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default IconCard;