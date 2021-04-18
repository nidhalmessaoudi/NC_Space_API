export default () => {
    process.on("uncaughtException", err => {

        console.log(err.name, err.message);
        console.log("UNCAUGHT EXCEPTION! Server shutting down...");
        process.exit(1);

    });
}