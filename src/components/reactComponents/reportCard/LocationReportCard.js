import React from "react";
import { Card } from "react-bootstrap";
import * as Styles from '../../constants/styles/styles'

//This is a React Card object used for displaying the information collected...
//...from the "By Location" data report in the ReportPage.js

function LocationReportCard(props) {
    return (
        <Card style={Styles.CardContainer}>
            <Card.Body>
                <Card.Title>Location Data Report</Card.Title>
                <Card.Text style={Styles.TotalText}>Total proccesed: </Card.Text>
                <Card.Text>{props.totalProccesed}</Card.Text>
                <Card.Text style={Styles.TotalText}>Total for each manufacturer:</Card.Text>
                <Card.Text>Moderna: {props.totalModerna}      Pfizer: {props.totalPfizer}</Card.Text>
                <Card.Text>J&J: {props.totalJnJ}     Astrozeneka: {props.totalAstrozeneka}</Card.Text>
                <Card.Text>New vaccine: {props.totalNewVaccine}</Card.Text>
                <Card.Text style={Styles.TotalText} >Total for each shot type:</Card.Text>
                <Card.Text>Immunization 1: {props.totalImm1}     Immunization 2: {props.totalImm2}</Card.Text>
                <Card.Text>Booster 1: {props.totalBooster1}     Booster 2: {props.totalBooster2}</Card.Text>
                <Card.Text>Booster 3: {props.totalBooster3}     Unknown: {props.totalUnknown}</Card.Text>
                <Card.Text style={Styles.TotalText} >Total adverse effects:</Card.Text>
                <Card.Text>{props.totalSideEffects}</Card.Text>
            </Card.Body>
        </Card>
    )
}

export default LocationReportCard;