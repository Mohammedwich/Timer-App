
import { StatusBar, Button } from 'expo-status-bar';
import React from 'react'; 
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Picker, } from 'react-native';
import { render } from 'react-dom';


const screenDimensions = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonStyle: {
      borderWidth: 10,
      borderColor: "#00ccff",
      width: screenDimensions.width / 2,
      height: screenDimensions.width / 2,
      borderRadius: screenDimensions.width /2,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 30
  },
  startButtonText: {
      fontSize: 45,
      color: "#00ccff",
  },
  stopButtonStyle:{ 
      borderColor: "#ff0000",
  },
  stopButtonText: {
      color: "#ff0000",
  },
  timerText: {
      fontSize: 90,
      color: "#fff",
  },
  pickerContainer: {
      flexDirection: "row",
      alignItems: "center"
  },
  pickerStyle: {
      width: 50,      
      backgroundColor: "#444",
  },
  pickerItemStyle: {
      
      color: "#fff",
      fontSize: 20,
      paddingHorizontal: 5,
  },
});


export default class App extends React.Component {
    state = {
        remainingSeconds: 5,
        isTimerRunning: false,
        selectedMinutes: "0", //picker returns strings so these are strings
        selectedSeconds: "5",
    }; 

    //putting this variable here for the record
    subtractionInterval = null;
    

    componentDidUpdate(prevProp, prevState) {
        //prevState check to avoid infinite loop when stop() updates it from 0 to something else
        if (this.state.remainingSeconds === 0 && prevState.remainingSeconds !== 0) { 
            this.stopCounter();
        }
    }

    // clear interval to avoid memory leak
    componentWillUnmount() {
        if (this.subtractionInterval) {
            clearInterval(this.subtractionInterval);
        }
    }
  
    startCounter = () => {
        this.setState(state => ({
            remainingSeconds: parseInt(state.selectedMinutes) * 60 + parseInt(state.selectedSeconds),
            isTimerRunning: true,
        }));

        //Assign setInterval to a variable so we can reference it later to delete it
        this.subtractionInterval = setInterval(() => {
            this.setState(state => ({
                remainingSeconds: state.remainingSeconds - 1
            }));
        }, 1000);
    };

    stopCounter = () => {
        clearInterval(this.subtractionInterval);
        this.subtractionInterval = null;
        this.setState({ 
            remainingSeconds: 5, //temporary(redundant now?)
            isTimerRunning: false,
        });
    }

    renderPickers = () => {
        return (
            <View style={styles.pickerContainer}>
                <Picker style={styles.pickerStyle} itemStyle={styles.pickerItemStyle} selectedValue={this.state.selectedMinutes} 
                onValueChange={itemValue => {
                    //update the state
                    this.setState({selectedMinutes: itemValue });
                }}
                >
                    {AVAILABLE_MINUTES.map(value => (
                        <Picker.Item key={value} label={value} value={value} />
                    ))}
                </Picker>
                <Text style={styles.pickerItemStyle}>Minutes</Text>
                

                <Picker style={styles.pickerStyle} itemStyle={styles.pickerItemStyle} selectedValue={this.state.selectedSeconds}
                onValueChange={itemValue => {
                    //update the state
                    this.setState({ selectedSeconds: itemValue });
                }}
                >
                    {AVAILABLE_SECONDS.map(value => (
                        <Picker.Item key={value} label={value} value={value} />
                    ))}
                </Picker>
                <Text style={styles.pickerItemStyle}>Seconds</Text>
            </View>
        )
    }

    render() {
        //object destructuring. Getting the result from the function and putting them in multiple variables
        const {minutes, seconds} = getRemainingTimeWithMinutesAndSecond(this.state.remainingSeconds);

        return (
            <View style={styles.container}>
                {
                    this.state.isTimerRunning ? (
                    //{/*string interpolation is used in this text. The numbers are being padded to 2 digits aleast with a leading 0*/}
                        <Text style={styles.timerText} >{`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}</Text>
                    ) : (
                        this.renderPickers()
                    )
                }

                {
                    this.state.isTimerRunning ? (
                        <TouchableOpacity onPress={this.stopCounter} style={[styles.startButtonStyle, styles.stopButtonStyle]}>
                            <Text style={[styles.startButtonText, styles.stopButtonText]}>Stop</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={this.startCounter} style={styles.startButtonStyle}>
                            <Text style={styles.startButtonText}>Start</Text>
                        </TouchableOpacity>
                    )
                } 
              <StatusBar style="light" />
            </View>
          );  //Stacking start and stop style(overwrites color of start)
    }
  }


// This function will take remaining seconds and return it in minutes and seconds inside an object
const getRemainingTimeWithMinutesAndSecond = (secondsTotal) => {
    const minutes = Math.floor(secondsTotal / 60);
    const seconds = secondsTotal % 60;

    return { minutes, seconds};
}

//Ths function is for easily filling the AVAILABLE_MINUTES and AVAILABLE_SECONDS arrays
const createArray = length => {
    const arr = [];
    let i = 0;
    while (i < length) {
        arr.push(i.toString()); //toString so we can use the value as a prop value for PickerItem
        i += 1;
    }

    return arr;
}

const AVAILABLE_MINUTES = createArray(10);
const AVAILABLE_SECONDS = createArray(60);