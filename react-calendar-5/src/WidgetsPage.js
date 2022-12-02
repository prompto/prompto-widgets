import React from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import DateTime from "./intrinsic/DateTime";

export default class WidgetsPage extends React.Component {

    constructor(props) {
        super(props);
        const start = DateTime.parse('2022-11-28T16:15');
        const end = DateTime.parse('2022-11-28T17:00');
        this.state = { weekendsVisible: true, currentEvents: [
                { id: 1, title: "RDV médecin", start: start.date, end: end.date}
            ] };
    }

    render() {
        return <div className="full-calendar-page">
            <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                          initialView="timeGridWeek"
                          editable={true} selectable={true}
                          events={this.state.currentEvents}
            />
        </div>;
    }
}
