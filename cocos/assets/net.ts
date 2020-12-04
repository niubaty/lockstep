
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    common_parent_node: cc.Node = null;

    @property(cc.Prefab)
    remote_prefab: cc.Prefab = null;

    @property
    remote_address: string = '127.0.0.1:5678';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public conn;
    // cos必为串行

    public cos=[];

    // public my_user_name;

    start () {
        this.node.on('connect',this.connect,this);
        this.node.on('remote_input',this.handle_send,this);
    }

    connect(myusername){
        this.conn = new WebSocket('ws://'+this.remote_address);
        this.conn.onopen = (e)=>{
            cc.log('connected');
            // 用于测试
            // this.cos.push(this.auto_test());
        };
        this.conn.onerror = (e)=>{cc.log('ws err')};
        this.conn.onclose = (e)=>{cc.log('ws close')};
        this.conn.onmessage = (this.handle_recv).bind(this);
        // yield;
        this.cos.push(this.connect_remote(myusername));
    }

    * connect_remote(my_user_name){
        while(this.conn.readyState!=WebSocket.OPEN)
            yield;
        this.conn.send(my_user_name+':123456');
    }

    handle_recv(event){
        cc.log(event.data);
        let obj = JSON.parse(event.data);
        let count = Object.keys(obj)[0];
        let states = obj[count];
        let names = Object.keys(states);
        for(let name of names){
            let node = this.common_parent_node.getChildByName('player_'+name);
            if(node==undefined){
                node = cc.instantiate(this.remote_prefab);
                node.parent = this.common_parent_node;
                node.name = 'player_'+name;
            }
            node.emit('iteratation',states[name]);
        }

    }

    handle_send(obj){
        this.conn.send(JSON.stringify(obj));
    }

    // * auto_test(){
    //     cc.log('auto send test');
    //     while(this.conn.readyState!=WebSocket.OPEN)
    //         yield;
    //     cc.log('auto send start');
    //     this.conn.send('cocos:123456');
    //     for(let i =0;i<500;i++){
    //         let c = JSON.stringify({'hp':Math.random()*100,'atk':Math.random()*50}); 
    //         for(let j=0;j<Math.random()*5+5;j++)
    //             yield;
    //         this.conn.send(c);
    //     }
    // }




    update (dt) {
        if(this.cos.length>0)
            if(this.cos[0].next().done)
                this.cos.splice(0,1);
    }
}
