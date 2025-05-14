const app = require("./app")
const { port } = require("./utils")
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})