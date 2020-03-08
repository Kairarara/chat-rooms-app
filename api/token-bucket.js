class TokenBucket{
    constructor(){
        this.msgCap=20;
        this.msgTokens=20;
        setInterval(() => {
        this.addMsgToken()
        }, 2184);

        this.loginCap=7;
        this.loginTokens=7;
        setInterval(() => {
        this.addLoginToken()
        }, 56927);
    }

    addMsgToken=()=>{
        if(this.msgTokens<this.msgCap)
            this.msgTokens+=1;
    }

    removeMsgToken=()=>{
        if(this.msgTokens>0){
            this.msgTokens-=1;
            return true;
        }
        return false;
    }

    addLoginToken=()=>{
        if(this.loginTokens<this.loginCap)
            this.loginTokens+=1;
    }

    removeLoginToken=()=>{
        if(this.loginTokens>0){
            this.loginTokens-=1;
            return true;
        }
        return false;
    }
}

module.exports = TokenBucket;

