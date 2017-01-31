import React from 'react';
import myAjax from './ajax.jsx';
class SearchInput extends React.Component {

    constructor(props) {
        if(!props){props={};}
        super(props);
        this.searchtxt_el={};
        this.api_url=(typeof(props.api_url)==='string'?props.api_url:'');
        this.state={
            'isloading':false,
            'searchstr':''
        };

        this.binded={'onsearch':false};
        this.search_events=['change','paste','keyup','keydown','keypress','focus','blur'];
        this.delay_obj={
            'query':'',
            'timeoutid':false
        };
    }
    ajaxData(query,donecb){
        var self=this;
        if(!self.state.isloading){
            var outfunc=function(err,res){
                if(typeof(donecb)==='function'){donecb.apply(self,[err,res]);}
                self.setState({'isloading':false});
                self.props.onweatherres(err,res);
            };
            self.setState({'isloading':true});

            requestAnimationFrame(function(){
                var ajax = new myAjax({'base_url':self.api_url});
                ajax.post({'url':'data','payload':query},function(res){
                    var data_list=JSON.parse(res);
                    outfunc(null,data_list);
                },function(res){
                    outfunc(new Error("Something went wrong with the ajax call."),res);
                });
            });
        }
    }

    ajaxSearch(query,donecb){
        var self=this;
        if(!self.state.isloading && self.state.searchstr!==query){
            var outfunc=function(err,res){
                self.delay_obj.query=query;
                self.onSearch();//update the vars since the request happened
                if(typeof(donecb)==='function'){donecb.apply(self,[err,res]);}
                self.setState({'isloading':false});
                self.props.onsearchres(err,res,query);
            };

            self.setState({'isloading':true});
            requestAnimationFrame(function(){
                var ajax = new myAjax({'base_url':self.api_url});
                ajax.post({'url':'search','payload':{'q':query}},function(res){
                    var data_list=JSON.parse(res);//"_id":6087824,"name":"New Toronto","Hashname":"new toronto","country":"CA","coord":{"lat":43.600189,"lon":-79.505272}
                    outfunc(null,data_list);
                },function(res){
                    self.setState({'cities': [] });
                    outfunc(new Error("Something went wrong with the ajax call."),res);
                });
            });
        }
    }
    onClickEvent(ev){
        var self=this;
        ev.stopPropagation();
        ev.preventDefault();
        self.props.clickcb(ev);
        return false;
    }
    onSearch(){
        var self=this,
            clear_timeout=function(){
                if(self.delay_obj.timeoutid!==false){
                    clearTimeout(self.delay_obj.timeoutid);
                    self.delay_obj.timeoutid=false;
                }
            };
        //clear_timeout();
        if(self.delay_obj.query!==self.searchtxt_el.value){
            self.delay_obj.timeoutid=setTimeout(function(){
                clear_timeout();
                // console.log("self.delay_obj.query: ",self.delay_obj.query);
                self.ajaxSearch(self.delay_obj.query);
                self.setState({
                    'searchstr': self.delay_obj.query
                });
            },3000);
            self.delay_obj.query=self.searchtxt_el.value;
        }

    }
    componentDidMount(){
        var self=this;
        self.searchtxt_el=self.refs['searchtxt-el'];

        if(self.binded.onsearch===false){
            self.binded.onsearch=self.onSearch.bind(this);
            self.search_events.forEach((v)=>{
                self.searchtxt_el.addEventListener(v, self.binded.onsearch);
            });
        }

        self.searchtxt_el.value=(self.props.searchstr.length>0?self.props.searchstr:'');
        self.onSearch();
        self.props.onmount(self);
    }
    componentWillUnmount(){
        var self=this;

        self.search_events.forEach((v)=>{
            self.searchtxt_el.removeEventListener(v, self.binded.onsearch);
        });
        self.binded.onsearch=false;

        if(self.delay_obj.timeoutid!==false){clearTimeout(self.delay_obj.timeoutid);}
        self.props.onunmount(self);
    }
    componentWillUpdate(nextProps, nextState){
        var self=this;
        if(nextState.isloading!==self.state.isloading && typeof(self.props.onloadingchange)==='function'){
            self.props.onloadingchange(self,nextState.isloading);
        }
    }
    dudEvent(ev){
        ev.stopPropagation();
        ev.preventDefault();
        return false;
    }
    render() {
        return (
            <form onSubmit={self.dudEvent}>
                <input type="text" className="searchtxt" name="searchtxt" id="searchtxt" ref="searchtxt-el" />
            </form>
        );
    }

}

export default SearchInput;
