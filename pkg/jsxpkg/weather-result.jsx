import React from 'react';
class WeatherResult extends React.Component {

    constructor(props) {
        super(props);
        // this.state={'nodes':[]};
        this.backclick_el={};
        this.binded={'onclick':false};
    }
    onClickEvent(ev){
        var self=this;
        ev.stopPropagation();
        ev.preventDefault();
        self.props.clickcb(ev);
        return false;
    }
    componentDidMount(){
        var self=this;
        self.backclick_el=self.refs['back-click-el'];

        if(self.binded.onclick===false){
            self.binded.onclick=self.onClickEvent.bind(this);
            self.backclick_el.addEventListener("click", self.binded.onclick);
        }
    }
    componentWillUnmount(){
        var self=this;

        //removing event listener must be done this way; redoing a bind(this) will just result in removing handler of newly binded function
        if(self.binded.onclick!==false){
            window.removeEventListener("click", self.binded.onclick);
            self.binded.onclick=false;
        }
    }


    render() {
        var self=this,
            weather_data=this.props.result,
            conditions= weather_data.weather.map(function(item) {return item.main+', ';});
        return (
            <div className="weather-card">
                <a href="javascript:;" className="back-link" ref="back-click-el"><span>&#9664;</span> Back</a>
                <h2>{weather_data.name} <span>({weather_data.coord.lat}, {weather_data.coord.lon})</span></h2>
                <p>Conditions: {conditions}</p>
                <dl>
                    <dt>Visibility</dt>
                    <dd>{weather_data.visibility}</dd>

                    <dt>Wind</dt>
                    <dd>{weather_data.wind.speed}</dd>

                    <dt>Hi</dt>
                    <dd>{weather_data.main.temp_max}</dd>

                    <dt>Low</dt>
                    <dd>{weather_data.main.temp_min}</dd>
                </dl>
            </div>
        );
    }

}

export default WeatherResult;
