module.exports=(app)=>{
    app.use((err, req, res, next)=>{
        if(err instanceof ValidationError){
            console.error(err.details);
            res.status(400).send("Bad request")
        } else if(err.hasOwnPorperty("sqlState") ) {
            console.error(err)
            if(err.fatal){
                res.status(500).send("Fatal database error")
            } else {
                next(err);
            }
        } else {
            next(err);
        }
    })
}