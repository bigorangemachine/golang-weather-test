import React from 'react';
class LoadingBlock extends React.Component {

    constructor(props) {
        super(props);

    }
    onClickEvent(ev){
    }
    componentDidMount(){
        var self=this;
    }
    componentWillUnmount(){
        var self=this;

    }

    render() {
        var self=this,
            loadBlockClassName = (self.props.isloading?' show-loader':'');
console.log("this.props.isloading: ",self.props.isloading);
        return (
            <div className={'ajax-indicator flex-center-center load-blocker'+loadBlockClassName}>
                <p>Loading<span>.</span><span>.</span><span>.</span></p>
            </div>
        );
    }

}

export default LoadingBlock;
