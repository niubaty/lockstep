
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    remote_address: string = '127.0.0.1:5678';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public conn;
    // cos必为串行

    public cos=[];
    start () {
        this.cos.push(this.connect());
    }

    * connect(){
        this.conn = new WebSocket('ws://'+this.remote_address);
        this.conn.onopen = (e)=>{
            cc.log('connected');
            this.cos.push(this.auto_test());
        };
        this.conn.onerror = (e)=>{cc.log('ws err')};
        this.conn.onclose = (e)=>{cc.log('ws close')};
        this.conn.onmessage = this.handle_recv;
        // yield;
    }

    handle_recv(event){
        cc.log(event.data);
    }

    * auto_test(){
        cc.log('auto send test');
        while(this.conn.readyState!=WebSocket.OPEN)
            yield;
        cc.log('auto send start');
        this.conn.send('cocos:123456');
        for(let i =0;i<500;i++){
            let c = JSON.stringify({'hp':Math.random()*100,'atk':Math.random()*50}); 
            for(let j=0;j<Math.random()*5+5;j++)
                yield;
            this.conn.send(c);
        }
    }




    update (dt) {
        if(this.cos.length>0)
            if(this.cos[0].next().done)
                this.cos.splice(0,1);
    }
}
