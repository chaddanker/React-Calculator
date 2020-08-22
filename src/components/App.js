import React, { Component } from 'react';

import buttons from '../elements';

class App extends Component {

    state = {
        formula: "",
        display: "0",
        operands: [],
        hasResult: false,
        answer: 0,
        lastWasDigit: true
    };

    renderButton({ innerText, id }) {
        let width = 100;
        let btnVar = "btn-light";

        if(innerText === "="){
            width *= 3;
        }

        if(isNaN(Number(innerText))){
            btnVar = "btn-dark";
        }
        
        return <button 
                    className={`btn btn-mid ${innerText === "=" ? "btn-danger" : btnVar}`}
                    onClick={() => this.onButtonClick(innerText)}
                    style={{ 
                        width,
                        borderRadius: 0,
                        margin: 0,
                        height: 70
                    }}
                    id={id}
                >
                    {innerText}
                </button>;
    }

    renderButtons() {
        return buttons.map(button => {
            return this.renderButton(button);
        });
    }

    onButtonClick = (innerText) => {
        
        switch(innerText){
            case "+":
            case "-":
            case "/":
            case "x": {
                if(!this.state.hasResult) {
                    this.setState(state => ({
                        formula: state.formula + innerText,
                        operands: [...state.operands, innerText],
                        lastWasDigit: false
                    }));
                } else {
                    this.setState(state => ({
                        formula: state.answer + innerText,
                        operands: [innerText],
                        hasResult: false,
                        lastWasDigit: false
                    }));                    
                }

                break;
            }
            case "=": {
                const expression = this.state.formula;
        
                const answer = this.bodmas(expression); //first mulitiplication and division
        
                this.setState(state => ({
                    formula: state.formula + innerText + answer,
                    display: answer,
                    hasResult: true,
                    answer
                }));
            
                break;
            }
            case "C": return this.setState({ 
                formula: "",
                display: "0",
                operands: [],
                hasResult: false,
                answer: 0,
                lastWasDigit: true
            });
            case ".": { 
                const lastIndex = this.state.formula.lastIndexOf(".");
                if( lastIndex !== this.state.formula.length - 1 ){

                    let temp = this.state.formula;
                    if(this.state.operands.length > 0) {
                        this.state.operands.map(operator => {
                            temp = temp.split(operator);
                        });
                    }

                    console.log(temp);

                    if(temp.indexOf(".") === -1){
                        this.setState(state => {
                            let response = (state.display + innerText);
                            return ({
                            formula: state.formula + innerText,
                            display: response,
                            lastWasDigit: true
                        })});
                    }
                }

                break;
            }
            case "bcksp": {
                if( this.state.display !== "0" ) {  
                    this.setState(state => ({
                        formula: state.formula.slice(0, state.formula.length - 1),
                        display: state.display.slice(0, state.formula.length - 1)
                    }));

                    let lastChar = this.state.formula[this.state.formula.length - 1];
                    if(!isNaN(Number(lastChar)) || lastChar === ".") {
                        this.setState({
                            lastWasDigit: true
                        });
                    }
                }   

                break;
            }
            default: {
                if(this.state.display[0] === "0"){
                    this.setState(state => ({
                        formula: state.formula + innerText,
                        display: innerText,
                        lastWasDigit: true
                    }));

                    break;
                }

                // console.log(this.state.lastWasDigit);

                if(this.state.lastWasDigit) {
                    this.setState(state => {
                        console.log(state.lastWasDigit);
                    return ({
                        formula: state.formula + innerText,
                        display: state.display + innerText,
                        lastWasDigit: true
                    })});
                } else {
                    this.setState(state => ({
                        formula: state.formula + innerText,
                        display: innerText,
                        lastWasDigit: true
                    }));
                }

                break;
            }
        }
    }

    //calculates an expression as a formula - in BODMAS order 
    bodmas = (expression) => {

        if(!isNaN(expression)){
            return expression;
        }

        if(/[+][+]/.test(expression)){
            let operator = "+";
            let temp = expression.split("++");
            return this.calc(temp[0], operator, temp[1]);
        }

        if (/[x][-][+][\d]/.test(expression)) {
            let operator = "+";
            let temp = expression.split(operator);

            const final = temp.map(val => {
                if(/[-][+]/.test(val)) {
                    return val.replace("-+", "");
                } else {
                    return val.replace("+-", "");
                }
            });

            console.log(final);

            return this.calc(final[0], operator, final[1]);
        }
        
        if(/[x][-]|[-][x]/.test(expression) 
        || /[/][-]|[-][/]/.test(expression)) {
            let operator = expression.indexOf("x") ? "x" : "/";
            let temp = expression.split(operator);

            return this.calc(temp[0], operator, temp[1]);
        } 

        const values = expression.split(/[+^-]/);

        let result = values.map(val => {

            let operator = val.indexOf("x") !== -1 ? "x" : "/";
            
            let tempVals = val.split(operator);

            if(tempVals.length > 1){
                return String(this.calc(tempVals[0], operator, tempVals[1]));
            }
            return String(val);
        });

        if(result.length === 1 && !isNaN(result)) { return result; }

        console.log(result); //change below line to calc recursively

        let tempTotal = 0;

        let filtered = this.state.operands.filter(operator => operator === "+" ||
            operator === "-"
        );

        filtered.map((operand, i) => {
            if(i === 0){
                tempTotal += this.calc(result[0 + i], operand, result[1 + i]);
            } else {
                tempTotal = this.calc(tempTotal, operand, result[1 + i]);
            }

            console.log(tempTotal, operand, result[1 + i]);
        });

        return String(tempTotal);
    }

    calc(val1, operator, val2) {

        switch(operator){
            case "x": {
                return parseFloat(val1) * parseFloat(val2);
            }
            case "/": {
                return parseFloat(val1) / parseFloat(val2);
            }
            case "+": {
                return parseFloat(val1) + parseFloat(val2);
            }
            case "-": {
                return parseFloat(val1) - parseFloat(val2);
            }
            default: return "cannot process";
        }

    }

    render() {
        return (
            <div className="text-center">
                <div 
                    id="calculator"
                    className="container-sm text-center " 
                    style={{ 
                        width: 400, 
                        backgroundColor: "black", 
                        padding: 0, 
                        margin: "50px auto",
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)"
                    }}
                    >
                    <p 
                        className="text-right" 
                        style={{ 
                                color: "#fff", 
                                paddingTop: 15,
                                paddingRight: 40,
                                fontFamily: "'Orbitron', sans-serif"
                        }}
                    >
                        {this.state.formula}
                    </p>

                    <div 
                        id="display" 
                        style={{ 
                            backgroundColor: "#000",
                            color: "#fff",
                            borderRadius: 0,
                            width: 352,
                            margin: "3px auto",
                            border: "none",
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: 36
                        }}
                        class="form-control text-right"
                    >
                        {this.state.display}
                    </div>
                    {this.renderButtons()}
                    
                    
                </div>
                <p>Designed and Coded By 
                    <span style={{ color: "red", fontFamily: "'Orbitron', sans-serif" }}>
                         &nbsp;Chad Danker
                    </span>
                </p>
            </div>
        );
    }
};

export default App;