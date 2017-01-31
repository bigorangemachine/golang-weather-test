//styles first please
import './../../node_modules/minireset.css/minireset.sass';
import './../css/app.css';
import './../scss/core.scss';
import './../scss/core-UI.scss';

//react stuff
import React from 'react';
import {render} from 'react-dom';

import myAjax from './ajax.jsx';
import LoadingBlock from './loading-block.jsx';
import CityResult from './city-result.jsx';
import WeatherResult from './weather-result.jsx';
import SearchInput from './search-input.jsx';
// var request = require('expose?request');
//custom modules
import utils from 'bom-utils';
//var id_history='false';<- possible ES6 bug?

//root Component
class Weather extends React.Component {

    constructor(props) {
        super(props);
        this.root_el={};
        self.search_el={};
        this.state = {
            'searchstr':'Toronto',
            'cities':[],
            'isloading':false,
            'show':true,
            'view_context':{},
            'windowHeight': window.innerHeight,
            'windowWidth': window.innerWidth
        };
        this.binded={'onresize':false,'onscroll':false};

        this.api_url='http://localhost:9500/';


    }

    // react component event methods
    componentWillUnmount(){
        var self=this;

        //removing event listener must be done this way; redoing a bind(this) will just result in removing handler of newly binded function
        window.removeEventListener("resize", self.binded.onresize);
        window.removeEventListener("scroll", self.binded.onscroll);
        self.binded.onresize=false;
        self.binded.onscroll=false;
    }
    componentDidMount(){
        var self=this;
        self.root_el=self.refs['root-el'];
        self.search_el=self.refs['search-el'];
        //if you want to pass in 'this' & allow unbinding later; you must do it this way. Point to the functions' reference - don't unbind a 'newly' created instance of that function
        if(self.binded.onresize===false && self.binded.onscroll===false){
            self.binded.onresize=self.onWindowEvent.bind(this);
            self.binded.onscroll=self.onWindowEvent.bind(this);

            window.addEventListener("resize", self.binded.onresize);
            window.addEventListener("scroll", self.binded.onscroll);
        }
    }
    // \\ react component event methods

    updateWindowDims(widthIn,heightIn){
        var self=this;

        // filter manager?
        self.setState({
            'windowHeight': window.innerHeight,
            'windowWidth': window.innerWidth
        });
    }
    detailHandler(obj,ev){//on details clicked - get weather data
        var self=this;
console.log("detailHandler",obj);
console.log("self.search_el: ",self.search_el);
        self.search_el.ajaxData(obj.coord);
        // self.ajaxData(obj.coord);
    }
    onWindowEvent(){
        var self=this;
        //event is scroll/resize - IOS detect resize through scroll event?
        if(self.state.windowHeight!=window.innerHeight || self.state.windowWidth!=window.innerWidth){
            self.updateWindowDims(window.innerWidth, window.innerHeight);
        }
    }
    onLoadingChange (childObj,newloading) {
        var self=this;
console.log("onLoadingChange()",newloading,"\nchildObj: ",childObj);
        self.setState({'isloading':newloading});
    }
    onUnSearchMount (childObj) {
    }
    onSearchMount (childObj) {
        var self=this;
        childObj.api_url=self.api_url;
    }
    onSearchRes(err,res,q){
        var self=this;
console.log("onSearchRes ",res,self.state);
        self.setState({'searchstr':q});
        if(res.length===0 || err){
            self.setState({'cities': [] });
        }else{
            self.setState({'cities': res.map((v) => {
                var click_func=self.detailHandler.bind(self,v);
                return <CityResult key={v._id} ident={v._id} name={v.name} country={v.country}
                            coordlat={v.coord.lat} coordlon={v.coord.lon} clickcb={click_func} />
            })});
        }
    }
    onWeatherClose(){
        var self=this;
        self.setState({
            'view_context':{}
        });
    }
    onWeatherRes(err,res){
        var self=this;

        self.setState({
            'view_context':{
                'detail':res,
                'coord':res.coord
            }
        });
    }
    render () {
        var self=this,
            search_comp=<SearchInput ref="search-el" onmount={this.onSearchMount.bind(this)} onunmount={this.onUnSearchMount.bind(this)}
                            onsearchres={this.onSearchRes.bind(this)} onloadingchange={this.onLoadingChange.bind(this)}
                            onweatherres={this.onWeatherRes.bind(this)} searchstr={this.state.searchstr} />;

        if(!this.state.show){
            return null;
        }else if(utils.obj_valid_key(this.state.view_context,'detail')){
            return <div className="UI UI-root" ref="root-el">
                <LoadingBlock isloading={this.state.isloading} />
                {search_comp}
                <div className="city-list" ref="city-list-el">
                    <WeatherResult clickcb={this.onWeatherClose.bind(this)} result={this.state.view_context.detail}/>
                </div>
            </div>;
        }else{
            return <div className="UI UI-root" ref="root-el">
                {search_comp}
                <div className="city-list" ref="city-list-el">
                    <LoadingBlock isloading={this.state.isloading} />
                    {this.state.cities}
                </div>
            </div>;
        }
    }
}

render(<Weather/>, (document.querySelectorAll('.app').length>0?document.querySelectorAll('.app')[0]:document.body));
