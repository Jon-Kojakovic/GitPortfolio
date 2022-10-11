import React from "react";
import { Card } from "react-bootstrap";
import * as Styles from '../../constants/styles/styles'

//This is a react Card object used for displaying the information collected...
//...from the "Adverse Effects" data report in the ReportPage.js

function SideEffectsReportCard(props) {
    return (
       <Card style={Styles.CardContainer}>
           <Card.Body>
                <Card.Title>Side Effects Data Report</Card.Title>
                <Card.Text style={Styles.TotalText}>Date: </Card.Text>
                <Card.Text>{props.date}</Card.Text>
                <Card.Text style={Styles.TotalText}>Patient name: </Card.Text>
                <Card.Text>{props.patientName}</Card.Text>
                <Card.Text style={Styles.TotalText} >Shot:</Card.Text>
                <Card.Text>{props.type_of_vaccine}</Card.Text>
                <Card.Text style={Styles.TotalText} >Doctor name:</Card.Text>
                <Card.Text>{props.doctor}</Card.Text>
                <Card.Text style={Styles.TotalText} >Manufacturer:</Card.Text>
                <Card.Text>{props.manufacturer}</Card.Text>
                <Card.Text style={Styles.TotalText} >Brand:</Card.Text>
                <Card.Text>{props.brand}</Card.Text>
                <Card.Text style={Styles.TotalText} >Batch:</Card.Text>
                <Card.Text>{props.batch}</Card.Text>
                <Card.Text style={Styles.TotalText} >Adverse Effect:</Card.Text>
                <Card.Text>{props.side_effects}</Card.Text>
           </Card.Body>
       </Card>
    )
}

export default SideEffectsReportCard;