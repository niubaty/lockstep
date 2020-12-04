const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    debugbox: cc.EditBox = null;

    @property(cc.Node)
    net_node: cc.Node = null;



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public share_obj={};

    // private my_user_name;

    set_and_conn(){
        let my_user_name = this.debugbox.string;
        this.node.name = 'player_'+ my_user_name;
        this.net_node.emit('connect', my_user_name);
    }

    start () {
        
        this.node.on(cc.Node.EventType.TOUCH_MOVE,((e)=>{
            this.share_obj.x = e.getLocationX();
            this.share_obj.y = e.getLocationY();
            this.net_node.emit('remote_input',this.share_obj);
        }).bind(this),this);

        this.node.on('iteratation',this.iteratation,this);
    }

    iteratation(o){
        if(o.x!=undefined&&o.y!=undefined)
            this.node.setPosition(this.node.parent.convertToNodeSpaceAR(cc.v2(o.x,o.y)));
    }

}
