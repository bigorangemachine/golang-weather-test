import utils from 'bom-utils';

class myAjax{

        constructor(props) {
            this.base_url=utils.check_strip_last(props.base_url,'/')+'/';
        }
        post(opts,posFunc,negFunc){
            var xmlhttp = new XMLHttpRequest();

            var clean_url=this.base_url+(typeof(opts.url)==='string'?opts.url:''),
                post_payload=(typeof(opts.payload)==='string' || typeof(opts.payload)==='object'?opts.payload:'');
            xmlhttp.open("POST", clean_url, true);

            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");

            xmlhttp.onreadystatechange = this.resolverFunc(xmlhttp,posFunc,negFunc);
            post_payload=(typeof(post_payload)==='object'?this.subparam(post_payload):post_payload);
            xmlhttp.send(utils.check_strip_last(post_payload,'&'));
        }
        subparam(obj,key){//key is not for root calls
            var output='';
            // if(typeof(key)==='undefined' && typeof(window.postcsrf)==='object'){//root call! - populate csrf token
            //     for (var prop in window.postcsrf){obj[prop] = window.postcsrf[prop];}}

            for(var k in obj){
                if(typeof(obj[k])==='object'){
                    output=output + this.subparam(obj[k],k);
                }else{
                    output=output + (typeof(key)!=='undefined'?key+'['+k+']':k) + '=' + obj[k] + '&';
                }
            }
            return output;
        };
        get(opts,posFunc,negFunc){

        }
        resolverFunc(xmlReq,pos,neg){
            return function() {
                if (xmlReq.readyState == XMLHttpRequest.DONE ) {
                    if (xmlReq.status == 200) {
                        //   document.getElementById("myDiv").innerHTML = xmlReq.responseText;
                        pos(xmlReq.responseText);
                    }
                    //    else if (xmlReq.status == 400) {
                    //       console.log("400 xmlhttp: ",xmlReq);
                    //    }
                    else {
                        neg(xmlReq);
                    }
                }
            };
        }
}
export { myAjax as default}
