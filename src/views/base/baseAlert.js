import React, { Component } from "react";
import * as css from "./baseCss"
export default class BaseAlert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forAlert: false
        };

        this.hideAlert = this.hideAlert.bind(this);
        this.alertInstance = (
            <div style={css.style.alert} id="alert">
                <span style={css.style.closebtn} onClick={() => this.props.onClick()}>&times;</span>
                <strong><i style={css.style.font16} className="iconsminds-close"></i> Error Login</strong><br />
                <span style={css.style.fontDetail}>Username & password salah, silahkan periksa kembali..</span>
            </div>
        )
    }

    hideAlert() {
        this.setState({
            forAlert: true
        })
    }


    render() {
        const style = this.hideAlert ? {'display':'node'} : {};
        return (
            <div style={style}>
                {this.alertInstance}
            </div>
        );
    }
}
