import React from 'react';
import * as Styles from '../../constants/styles/styles'

function Footer(){
    return(
        <div style={Styles.Footer}>
            <div style={Styles.Grid}>
                <div className="grid-item">Contact us</div>
                <div className="grid-item">Information</div>
            </div>
        </div>
    )
}

export default Footer;