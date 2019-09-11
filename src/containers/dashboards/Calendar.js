import React from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
// import BigCalendar from "react-big-calendar";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from "moment";

import { CalendarToolbar } from "../../components/CalendarToolbar";
import IntlMessages from "../../helpers/IntlMessages";
import data from "../../data/events";

import { getDirection } from "../../helpers/Utils";


const Calendar = () => {
  const localizer = momentLocalizer(moment);
  return (
    <Card>
      <CardBody>
        <CardTitle>
          <IntlMessages id="dashboards.calendar" />
        </CardTitle>
        <BigCalendar
          localizer={localizer}
          style={{ minHeight: "500px" }}
          events={data}
          rtl={getDirection().isRtl}
          views={["month"]}
          components={{
            toolbar: CalendarToolbar
          }}
        />
      </CardBody>
    </Card>
  );
};
export default Calendar;
