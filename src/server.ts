import app from "./app";

const PORT  = process.env.PORT || 5000;

async function main(){
    try {
        app.listen( PORT, ()=>{
            console.log(`Server is running on ${PORT}`)
        } )
    } catch (error) {
        console.log("Error starting the server:", error);
        process.exit(1);
    }
}

main();