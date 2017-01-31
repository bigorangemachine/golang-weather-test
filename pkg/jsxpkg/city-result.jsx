import React from 'react';
class CityResult extends React.Component {

    constructor(props) {
        super(props);
        // this.state={'nodes':[]};
        this.detail_el={};
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
        self.detail_el=self.refs['detail-click-el'];

        if(self.binded.onclick===false){
            self.binded.onclick=self.onClickEvent.bind(this);
            self.detail_el.addEventListener("click", self.binded.onclick);
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
        var extraClassName=(typeof(this.props.className)==='string' && this.props.className.length>0?' '+this.props.className:'');
        return (
            <div className={'city-card'+extraClassName}>
                <h2>
                    {this.props.name}, {this.props.country}
                    <span className="padd-link">[<a href={'#lat:'+this.props.coordlat+':lon:'+this.props.coordlon+':'} ref="detail-click-el"> + </a>]</span>

                </h2>


            </div>
        );
    }

}

export default CityResult;
